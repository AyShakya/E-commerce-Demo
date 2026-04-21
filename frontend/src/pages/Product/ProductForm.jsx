import { useState } from "react";
import { createProduct, updateProduct } from "../../api/admin.product.api";
import { PRODUCT_CATEGORIES } from "../../api/categoryConstant";

export default function ProductForm({ product = {}, onClose, onSaved }) {
  const isEdit = Boolean(product._id);

  const [form, setForm] = useState({
    title: product.title || "",
    description: product.description || "",
    price: product.price || "",
    quantity: product.quantity || "",
    category: product.category || "",
    tags: product.tags?.join(", ") || "",
  });

  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const inputClass =
    "w-full p-3 bg-transparent text-white border border-white/20 placeholder-white/30 focus:outline-none focus:border-white/50 transition";

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim().toLowerCase())
          : [],
      };

      const data = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        data.append(k, Array.isArray(v) ? JSON.stringify(v) : v);
      });

      images.forEach((img) => data.append("images", img));

      if (isEdit) {
        await updateProduct(product._id, data);
      } else {
        await createProduct(data);
      }

      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-[#050505] border border-white/20 p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="border-b border-white/20 pb-6 mb-6">
          <h2 className="text-3xl font-serif italic tracking-tight text-white">
            {isEdit ? "Update Product" : "Create Product"}
          </h2>
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mt-2">
            {isEdit ? "Edit catalog entry" : "Add new catalog entry"}
          </p>
        </div>

        <div className="space-y-5">
          <input
            name="title"
            placeholder="Product title"
            value={form.title}
            onChange={handleChange}
            className={inputClass}
            required
          />

          <textarea
            name="description"
            placeholder="Product description"
            value={form.description}
            onChange={handleChange}
            className={`${inputClass} h-32 resize-none`}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              className={inputClass}
              required
            />

            <input
              name="quantity"
              type="number"
              placeholder="Stock"
              value={form.quantity}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className={inputClass}
            required
          >
            <option value="" className="bg-black">
              Select category
            </option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-black">
                {cat}
              </option>
            ))}
          </select>

          <input
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
            className={inputClass}
          />

          <div className="border border-white/15 p-4 rounded bg-white/[0.02]">
            <p className="text-[10px] tracking-[0.25em] uppercase text-white/50 mb-3">Product Images</p>
            <input
              type="file"
              multiple
              onChange={(e) => setImages([...e.target.files])}
              className="block text-sm text-white/70"
            />
            {isEdit && Array.isArray(product.images) && product.images.length > 0 && (
              <p className="text-xs text-white/40 mt-3">
                Existing images: {product.images.length}. Upload new files only if you want to replace or add images.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row md:justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="border border-white/20 px-5 py-3 text-white/70 hover:text-white hover:border-white/40 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="bg-white text-black px-8 py-3 text-[11px] font-black uppercase tracking-[0.3em] disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
