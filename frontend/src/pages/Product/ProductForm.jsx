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

  const inputClass =
    "w-full p-3 bg-[#1c1c1c] text-white border border-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-white transition";

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-[#0b0b0b] border border-[#2a2a2a] p-8 w-full max-w-lg"
      >
        <h2 className="text-xl mb-6">
          {isEdit ? "Edit Product" : "Add Product"}
        </h2>

        <div className="space-y-4">
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
            className={`${inputClass} h-28 resize-none`}
            required
          />

          <div className="grid grid-cols-2 gap-4">
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
            <option value="">Select category</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, tags: e.target.value }))
            }
            className={inputClass}
          />

          <div className="text-sm text-gray-400">
            Product Images
            <input
              type="file"
              multiple
              onChange={(e) => setImages([...e.target.files])}
              className="mt-2 block"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="border px-4 py-2 text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="border border-white px-6 py-2 hover:bg-white hover:text-black transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
