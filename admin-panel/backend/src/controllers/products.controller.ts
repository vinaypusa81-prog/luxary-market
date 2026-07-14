import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { InventoryHistory } from '../models/InventoryHistory';
import { SyncService } from '../services/sync.service';
import { AuditLog } from '../models/AuditLog';
import { handleImageUpload } from '../middleware/upload';

// Helper to compile activity logs
const logAdminAction = async (req: any, action: string, details: string) => {
  if (req.user) {
    await AuditLog.create({
      adminId: req.user.id,
      adminName: req.user.name || 'System Administrator',
      action,
      details,
      ipAddress: req.ip
    });
  }
};

// ── GET /api/products ──────────────────────────────────────────
export const getProducts = async (req: Request, res: Response) => {
  const { search, category, status, brand, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc', page = '1', limit = '10' } = req.query;

  try {
    const query: any = { isDeleted: false };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    // Advanced filters
    if (category) query.category = category;
    if (status) query.status = status;
    if (brand) query.brand = brand;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Pagination
    const p = Math.max(1, parseInt(page as string, 10));
    const l = Math.max(1, parseInt(limit as string, 10));
    const skip = (p - 1) * l;

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(l),
      Product.countDocuments(query),
    ]);

    res.json({
      data: products,
      pagination: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/products/:id ──────────────────────────────────────
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/products ─────────────────────────────────────────
export const createProduct = async (req: any, res: Response) => {
  try {
    const fileUrls: string[] = [];
    
    // File uploads if present
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const url = await handleImageUpload(file);
        fileUrls.push(url);
      }
    }

    const bodyData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    
    if (fileUrls.length > 0) {
      bodyData.images = fileUrls;
      bodyData.thumbnail = fileUrls[0];
    }

    const product = new Product(bodyData);
    await product.save();

    // Log Stock change
    await InventoryHistory.create({
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      quantityChange: product.quantity,
      newQuantity: product.quantity,
      type: 'RESTOCK',
      reason: 'Product initialization stock intake',
      performedBy: req.user?.name || 'Admin'
    });

    // Write-through Sync to Postgres
    await SyncService.syncProductToPostgres(product);

    // Audit logs
    await logAdminAction(req, 'CREATE_PRODUCT', `Created product: ${product.name} (SKU: ${product.sku})`);

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/products/:id ───────────────────────────────────────
export const updateProduct = async (req: any, res: Response) => {
  try {
    const fileUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const url = await handleImageUpload(file);
        fileUrls.push(url);
      }
    }

    const updateData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    
    if (fileUrls.length > 0) {
      updateData.images = [...(updateData.images || []), ...fileUrls];
      updateData.thumbnail = updateData.images[0];
    }

    const originalProduct = await Product.findById(req.params.id);
    if (!originalProduct) return res.status(404).json({ message: 'Product not found' });

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });

    // Inventory logging if quantity changed
    if (updateData.quantity !== undefined && updateData.quantity !== originalProduct.quantity) {
      const diff = updateData.quantity - originalProduct.quantity;
      await InventoryHistory.create({
        productId: updatedProduct._id,
        productName: updatedProduct.name,
        sku: updatedProduct.sku,
        quantityChange: diff,
        newQuantity: updatedProduct.quantity,
        type: 'ADJUSTMENT',
        reason: 'Manual admin stock override',
        performedBy: req.user?.name || 'Admin'
      });
    }

    // Sync to Postgres
    await SyncService.syncProductToPostgres(updatedProduct);

    // Audit logs
    await logAdminAction(req, 'UPDATE_PRODUCT', `Updated product details: ${updatedProduct.name} (SKU: ${updatedProduct.sku})`);

    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/products/:id ───────────────────────────────────
export const deleteProduct = async (req: any, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.isDeleted = true;
    await product.save();

    // Sync deletion (archives/removes in Postgres)
    await SyncService.deleteProductFromPostgres(product.sku);

    // Audit logs
    await logAdminAction(req, 'DELETE_PRODUCT', `Soft deleted product: ${product.name} (SKU: ${product.sku})`);

    res.json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/products/duplicate/:id ───────────────────────────
export const duplicateProduct = async (req: any, res: Response) => {
  try {
    const source = await Product.findById(req.params.id);
    if (!source) return res.status(404).json({ message: 'Source product not found' });

    const duplicate = new Product({
      name: `${source.name} (Copy)`,
      description: source.description,
      category: source.category,
      categoryId: source.categoryId,
      brand: source.brand,
      brandId: source.brandId,
      sku: `${source.sku}-COPY-${Math.floor(100 + Math.random() * 900)}`,
      price: source.price,
      discountPrice: source.discountPrice,
      quantity: 0, // Set quantity to 0 for duplicated product
      images: source.images,
      thumbnail: source.thumbnail,
      color: source.color,
      size: source.size,
      tags: source.tags,
      shippingWeight: source.shippingWeight,
      dimensions: source.dimensions,
      status: 'DRAFT', // Duplicate sets to Draft
    });

    await duplicate.save();
    await SyncService.syncProductToPostgres(duplicate);

    await logAdminAction(req, 'DUPLICATE_PRODUCT', `Duplicated product ${source.sku} to ${duplicate.sku}`);

    res.status(201).json({ message: 'Product duplicated successfully as Draft', product: duplicate });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/products/bulk-delete ─────────────────────────────
export const bulkDeleteProducts = async (req: any, res: Response) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Array of ids required' });

  try {
    const products = await Product.find({ _id: { $in: ids } });
    for (const p of products) {
      p.isDeleted = true;
      await p.save();
      await SyncService.deleteProductFromPostgres(p.sku);
    }

    await logAdminAction(req, 'BULK_DELETE_PRODUCTS', `Deleted ${ids.length} products`);

    res.json({ message: `Successfully deleted ${ids.length} products` });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/products/bulk-update ─────────────────────────────
export const bulkUpdateProducts = async (req: any, res: Response) => {
  const { ids, updateData } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Array of ids required' });

  try {
    await Product.updateMany({ _id: { $in: ids } }, { $set: updateData });
    const updated = await Product.find({ _id: { $in: ids } });
    
    // Sync all updated products to Postgres
    for (const p of updated) {
      await SyncService.syncProductToPostgres(p);
    }

    await logAdminAction(req, 'BULK_UPDATE_PRODUCTS', `Updated ${ids.length} products with details: ${JSON.stringify(updateData)}`);

    res.json({ message: `Successfully updated ${ids.length} products` });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/products/export-csv ────────────────────────────────
export const exportProductsCSV = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ isDeleted: false });
    
    // Build CSV content
    const headers = 'SKU,Name,Category,Brand,Price,DiscountPrice,Quantity,Status,Rating\n';
    const rows = products.map(p => {
      const nameEscaped = `"${p.name.replace(/"/g, '""')}"`;
      return `${p.sku},${nameEscaped},${p.category},${p.brand || ''},${p.price},${p.discountPrice || ''},${p.quantity},${p.status},${p.rating}`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.status(200).send(headers + rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/products/import-csv ────────────────────────────────
export const importProductsCSV = async (req: any, res: Response) => {
  const { csvText } = req.body;
  if (!csvText) return res.status(400).json({ message: 'CSV text content is required' });

  try {
    const lines = csvText.split('\n');
    const importedCount = 0;
    
    // Minimal CSV parser
    const headers = lines[0].split(',');
    const skuIndex = headers.indexOf('SKU');
    const nameIndex = headers.indexOf('Name');
    const categoryIndex = headers.indexOf('Category');
    const priceIndex = headers.indexOf('Price');
    const qtyIndex = headers.indexOf('Quantity');

    if (skuIndex === -1 || nameIndex === -1 || categoryIndex === -1 || priceIndex === -1) {
      return res.status(400).json({ message: 'CSV missing required headers (SKU, Name, Category, Price)' });
    }

    let count = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Simple splitter (ignores inner commas inside quotes for simplicity but works for basic rows)
      const cols = line.split(',');
      const sku = cols[skuIndex]?.trim();
      const name = cols[nameIndex]?.trim().replace(/^"|"$/g, '');
      const category = cols[categoryIndex]?.trim();
      const price = parseFloat(cols[priceIndex]);
      const quantity = qtyIndex !== -1 ? parseInt(cols[qtyIndex] || '0', 10) : 0;

      if (sku && name && category && !isNaN(price)) {
        const prod = await Product.findOneAndUpdate(
          { sku },
          { name, category, price, quantity, status: 'ACTIVE', description: 'CSV Imported Product description.' },
          { upsert: true, new: true }
        );
        await SyncService.syncProductToPostgres(prod);
        count++;
      }
    }

    await logAdminAction(req, 'IMPORT_CSV_PRODUCTS', `Successfully imported ${count} products from CSV`);

    res.json({ message: `Successfully parsed and imported ${count} products` });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
