"use client";

import React, { useState } from "react";
import { useApp, Product } from "@/context/AppContext";
import { 
  Plus, 
  Trash2, 
  Edit, 
  ArrowLeft
} from "lucide-react";

export default function AdminProductsPage() {
  const { 
    products, 
    addProduct, 
    editProduct, 
    deleteProduct,
    session
  } = useApp();

  // Product Form states
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const [productForm, setProductForm] = useState<Omit<Product, "id" | "rating" | "reviewCount">>({
    name: "",
    category: "Shalwar Kameez",
    originalPrice: 2999,
    salePrice: 1999,
    discount: 33,
    images: [""],
    sizes: ["S", "M", "L", "XL"],
    colors: [],
    inStock: true,
    isBestSeller: false,
    isFastSelling: false,
    isSale: false,
    fabric: "Premium Raw Silk Blend",
    description: "Elegant and classy luxury suit crafted with high-end weaves for festive and premium daily ensembles.",
    careInstructions: "Dry Clean recommended to preserve quality.",
    shippingInfo: "Shipped within 2-3 business days.",
    returnPolicy: "Hassle-free 7-day returns."
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session?.token || ""}`
          },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          uploadedUrls.push(data.url);
        } else {
          const err = await res.json();
          console.error(`Upload failed for file ${files[i].name}: ${err.error}`);
        }
      }

      if (uploadedUrls.length > 0) {
        setProductForm(p => {
          const existing = p.images.filter(url => url !== "");
          return {
            ...p,
            images: [...existing, ...uploadedUrls]
          };
        });
      }
    } catch (err: any) {
      console.error(err);
      alert(`Upload error: ${err.message || "Could not connect to upload API"}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productForm.name || !productForm.name.trim()) {
      alert("Product name is required.");
      return;
    }

    if (!productForm.images[0] || productForm.images[0].trim() === "") {
      alert("Please upload a product image. Image upload is required.");
      return;
    }

    if (!productForm.sizes || productForm.sizes.length === 0) {
      alert("At least one size is required. Please select or add a size.");
      return;
    }

    const disc = Math.round(((productForm.originalPrice - productForm.salePrice) / productForm.originalPrice) * 100);
    const dataToSubmit = { ...productForm, discount: disc };

    if (editingProductId) {
      await editProduct(editingProductId, dataToSubmit);
      setEditingProductId(null);
    } else {
      await addProduct(dataToSubmit);
    }

    setIsAddingProduct(false);
    setProductForm({
      name: "",
      category: "Shalwar Kameez",
      originalPrice: 2999,
      salePrice: 1999,
      discount: 33,
      images: [""],
      sizes: ["S", "M", "L", "XL"],
      colors: [],
      inStock: true,
      isBestSeller: false,
      isFastSelling: false,
      isSale: false,
      fabric: "Premium Raw Silk Blend",
      description: "Elegant and classy luxury suit.",
      careInstructions: "Dry Clean recommended.",
      shippingInfo: "Shipped within 2-3 business days.",
      returnPolicy: "Hassle-free 7-day returns."
    });
  };

  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      category: product.category,
      originalPrice: product.originalPrice,
      salePrice: product.salePrice,
      discount: product.discount,
      images: product.images,
      sizes: product.sizes,
      colors: product.colors,
      inStock: product.inStock,
      isBestSeller: product.isBestSeller,
      isFastSelling: product.isFastSelling,
      isSale: product.isSale,
      fabric: product.fabric,
      description: product.description,
      careInstructions: product.careInstructions,
      shippingInfo: product.shippingInfo,
      returnPolicy: product.returnPolicy
    });
    setIsAddingProduct(true);
  };

  return (
    <div className="space-y-6">
      {!isAddingProduct ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-4 gap-4">
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-tight text-zinc-900">Product Inventory</h1>
              <p className="text-xs text-zinc-500 mt-1">Manage, edit, or delete items shown on the store</p>
            </div>
            <button
              onClick={() => setIsAddingProduct(true)}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors shadow-xs"
            >
              <Plus size={16} /> 
              <span>Add New Product</span>
            </button>
          </div>

          {/* PRODUCTS TABLE */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 font-bold uppercase tracking-wider text-[10px] text-zinc-600">
                    <th className="p-4 border-r border-zinc-100">Garment details</th>
                    <th className="p-4 border-r border-zinc-100">Category</th>
                    <th className="p-4 border-r border-zinc-100">Original price</th>
                    <th className="p-4 border-r border-zinc-100">Sale price</th>
                    <th className="p-4 text-center border-r border-zinc-100">Stock Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-medium">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-400">
                        No products found. Click &quot;Add New Product&quot; to create one.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="p-4 border-r border-zinc-100 flex items-center space-x-3">
                          <div className="w-10 h-12 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 flex-shrink-0 shadow-xs">
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="text-xs">
                            <p className="font-bold text-zinc-900">{product.name}</p>
                            <p className="text-[10px] text-zinc-400 font-mono uppercase">SKU ID: {product.id}</p>
                          </div>
                        </td>
                        <td className="p-4 border-r border-zinc-100 uppercase text-[10px] text-zinc-600">{product.category}</td>
                        <td className="p-4 border-r border-zinc-100 text-zinc-500 line-through">₹{product.originalPrice}</td>
                        <td className="p-4 border-r border-zinc-100 font-bold text-teal-700">₹{product.salePrice}</td>
                        <td className="p-4 text-center border-r border-zinc-100">
                          <span className={`inline-block border px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider ${
                            product.inStock 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {product.inStock ? "In Stock" : "Sold Out"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end space-x-1.5">
                            <button
                              onClick={() => handleEditClick(product)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg text-[10px] font-bold uppercase transition-colors"
                              title="Edit Product"
                            >
                              <Edit size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                if(confirm("Are you sure you want to delete this product?")) {
                                  deleteProduct(product.id);
                                }
                              }}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-red-600 border border-zinc-200 rounded-lg text-[10px] font-bold uppercase transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* PRODUCT FORM */
        <div className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-zinc-200 pb-4">
            <button 
              onClick={() => {
                setIsAddingProduct(false);
                setEditingProductId(null);
              }}
              className="p-2 border border-zinc-300 hover:bg-zinc-100 rounded-xl transition-colors bg-white text-zinc-700"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                {editingProductId ? "Modify SKU Details" : "Create New Product"}
              </h1>
              <p className="text-xs text-zinc-500 mt-1">Configure garment options and pricing strategy</p>
            </div>
          </div>

          <form onSubmit={handleProductSubmit} className="space-y-6 max-w-2xl bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Name */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Product Title / Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-zinc-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition-all"
                  placeholder="e.g. Shalimar Heavily Embroidered Kurta"
                />
                <span className="text-[9px] text-zinc-400">Visible to customers as the main product header</span>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Store Category *</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-zinc-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition-all uppercase font-medium"
                >
                  <option value="Shalwar Kameez">Shalwar Kameez</option>
                  <option value="Kurtis">Kurtis</option>
                  <option value="Bridal Wear">Bridal Wear</option>
                  <option value="Party Wear">Party Wear</option>
                  <option value="Casuals">Casuals</option>
                </select>
              </div>

              {/* Stock Status */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Inventory Status *</label>
                <select
                  value={productForm.inStock ? "true" : "false"}
                  onChange={(e) => setProductForm(p => ({ ...p, inStock: e.target.value === "true" }))}
                  className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-zinc-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition-all uppercase font-medium"
                >
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>

              {/* Original Price */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Original Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={productForm.originalPrice}
                  onChange={(e) => setProductForm(p => ({ ...p, originalPrice: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-zinc-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition-all"
                  placeholder="Price before discount"
                />
                <span className="text-[9px] text-zinc-400">Crossed-out reference price</span>
              </div>

              {/* Sale Price */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Sale Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={productForm.salePrice}
                  onChange={(e) => setProductForm(p => ({ ...p, salePrice: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-zinc-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition-all"
                  placeholder="Price customers actually pay"
                />
                <span className="text-[9px] text-zinc-400">Actual amount charged at checkout</span>
              </div>

              {/* File Upload Selector */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Garment Images (Multiple Allowed) *</label>
                <div className="flex flex-col space-y-4 p-4 border border-zinc-200 rounded-xl bg-zinc-50/50">
                  
                  {/* Image Previews */}
                  <div className="flex flex-wrap gap-4">
                    {productForm.images.filter(url => url !== "").length > 0 ? (
                      productForm.images.filter(url => url !== "").map((url, index) => (
                        <div key={index} className="flex flex-col items-center space-y-1.5 flex-shrink-0">
                          <div className="w-16 h-20 rounded-lg overflow-hidden border border-zinc-200 bg-white shadow-xs relative group">
                            <img src={url} alt={`Garment preview ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[8px] text-white font-mono uppercase font-bold text-center px-1">Uploaded</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setProductForm(p => {
                              const newImages = [...p.images];
                              newImages.splice(index, 1);
                              if (newImages.length === 0) newImages.push("");
                              return { ...p, images: newImages };
                            })}
                            className="text-[10px] text-rose-600 hover:text-rose-700 font-bold uppercase tracking-wider hover:underline transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="w-16 h-20 rounded-lg border border-dashed border-zinc-300 bg-white flex-shrink-0 flex items-center justify-center text-zinc-400">
                        <span className="text-[9px] uppercase font-bold tracking-tight text-center px-1 font-mono">No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-grow space-y-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-xs text-zinc-500
                        file:mr-4 file:py-1.5 file:px-3
                        file:rounded-md file:border file:border-teal-200
                        file:text-xs file:font-bold
                        file:bg-teal-50 file:text-teal-700
                        hover:file:bg-teal-100 file:cursor-pointer
                        transition-colors focus:outline-none"
                    />
                    {isUploading ? (
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2.5 h-2.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[9px] text-teal-700 font-bold uppercase tracking-wider animate-pulse">Uploading to Cloudinary...</span>
                      </div>
                    ) : (
                      <p className="text-[9px] text-zinc-500 leading-tight">
                        Select one or more images to upload. They will be uploaded directly to Cloudinary.
                      </p>
                    )}
                    <input
                      type="text"
                      required
                      value={productForm.images[0] || ""}
                      onChange={() => {}}
                      className="absolute w-0 h-0 opacity-0 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Fabric */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Fabric Specification *</label>
                <input
                  type="text"
                  required
                  value={productForm.fabric}
                  onChange={(e) => setProductForm(p => ({ ...p, fabric: e.target.value }))}
                  className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-zinc-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all"
                  placeholder="e.g. Pure Linen, Georgette, Velvet"
                />
              </div>

              {/* Sizes Selector */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Garment Sizes *</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((sz) => {
                    const isSelected = productForm.sizes.includes(sz);
                    return (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => {
                          setProductForm(p => {
                            const newSizes = p.sizes.includes(sz)
                              ? p.sizes.filter(s => s !== sz)
                              : [...p.sizes, sz];
                            return { ...p, sizes: newSizes };
                          });
                        }}
                        className={`px-3 py-1.5 border text-xs font-semibold rounded-lg transition-all ${
                          isSelected
                            ? "bg-teal-700 text-white border-teal-700 font-bold"
                            : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
                
                {/* Custom size input */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="custom-size-input"
                    placeholder="Add custom size (e.g. Free Size, 42)"
                    className="flex-grow bg-white text-xs px-3 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-teal-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val && !productForm.sizes.includes(val)) {
                          setProductForm(p => ({ ...p, sizes: [...p.sizes, val] }));
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("custom-size-input") as HTMLInputElement;
                      const val = input?.value.trim();
                      if (val && !productForm.sizes.includes(val)) {
                        setProductForm(p => ({ ...p, sizes: [...p.sizes, val] }));
                        input.value = "";
                      }
                    }}
                    className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-700 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                {/* Selected Custom sizes display if they are not in the standard list */}
                {productForm.sizes.filter(s => !["XS", "S", "M", "L", "XL", "XXL", "XXXL"].includes(s)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {productForm.sizes
                      .filter(s => !["XS", "S", "M", "L", "XL", "XXL", "XXXL"].includes(s))
                      .map((sz) => (
                        <span key={sz} className="inline-flex items-center bg-zinc-100 border border-zinc-200 text-zinc-800 text-[10px] font-semibold px-2 py-1 rounded-md">
                          {sz}
                          <button
                            type="button"
                            onClick={() => setProductForm(p => ({ ...p, sizes: p.sizes.filter(s => s !== sz) }))}
                            className="ml-1 text-zinc-400 hover:text-rose-600 focus:outline-none text-xs font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                )}
                <span className="text-[9px] text-zinc-400 block">At least one size is required. Click standard buttons or type and press Enter to add custom sizes.</span>
              </div>

              {/* Colors Selector */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Garment Colors (Optional)</label>
                
                {/* List of currently added colors */}
                {productForm.colors && productForm.colors.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {productForm.colors.map((color) => (
                      <span key={color} className="inline-flex items-center bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold px-3 py-1.5 rounded-lg">
                        {color}
                        <button
                          type="button"
                          onClick={() => setProductForm(p => ({ ...p, colors: p.colors.filter(c => c !== color) }))}
                          className="ml-2 text-teal-400 hover:text-rose-600 focus:outline-none text-xs font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">No colors added yet. Color selector will be hidden on customer side.</p>
                )}
                
                {/* Color input */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="custom-color-input"
                    placeholder="Add color (e.g. Crimson Red, Mint Green)"
                    className="flex-grow bg-white text-xs px-3 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-teal-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val && !productForm.colors.includes(val)) {
                          setProductForm(p => ({ ...p, colors: [...p.colors, val] }));
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("custom-color-input") as HTMLInputElement;
                      const val = input?.value.trim();
                      if (val && !productForm.colors.includes(val)) {
                        setProductForm(p => ({ ...p, colors: [...p.colors, val] }));
                        input.value = "";
                      }
                    }}
                    className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-700 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Add
                  </button>
                </div>
                <span className="text-[9px] text-zinc-400 block">Optional. Type a color and click Add or press Enter.</span>
              </div>

              {/* Badges checklist */}
              <div className="flex flex-wrap gap-4 items-center pt-2 sm:col-span-2">
                <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider cursor-pointer text-zinc-700">
                  <input
                    type="checkbox"
                    checked={productForm.isBestSeller}
                    onChange={(e) => setProductForm(p => ({ ...p, isBestSeller: e.target.checked }))}
                    className="rounded border-zinc-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <span>Best Seller Badge</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider cursor-pointer text-zinc-700">
                  <input
                    type="checkbox"
                    checked={productForm.isFastSelling}
                    onChange={(e) => setProductForm(p => ({ ...p, isFastSelling: e.target.checked }))}
                    className="rounded border-zinc-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <span>Fast Selling Badge</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider cursor-pointer text-zinc-700">
                  <input
                    type="checkbox"
                    checked={productForm.isSale}
                    onChange={(e) => setProductForm(p => ({ ...p, isSale: e.target.checked }))}
                    className="rounded border-zinc-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <span>Sale Badge</span>
                </label>
              </div>

              {/* Description */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={productForm.description}
                  onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-white text-xs px-3 py-2 border border-zinc-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none resize-none"
                  placeholder="Provide descriptive details of the dress design, sizing, and embroidery work"
                />
              </div>

            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-4 border-t border-zinc-200">
              <button
                type="submit"
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs px-6 py-2.5 rounded-lg font-bold uppercase tracking-wider transition-colors shadow-xs"
              >
                {editingProductId ? "Save Changes" : "Create Product"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingProduct(false);
                  setEditingProductId(null);
                }}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs px-6 py-2.5 rounded-lg font-bold uppercase tracking-wider border border-zinc-200 transition-colors shadow-xs"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}
