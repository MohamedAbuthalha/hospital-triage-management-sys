import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../auth/AuthContext";
import { COLORS } from "../theme/colors";
import {
  getPharmacyStats, getMedicines, addMedicine, updateMedicine, deleteMedicine,
  createSale, getSales, getDailySalesReport,
  getPrescriptions, fulfillPrescription,
} from "../api/pharmacy";
import Icon from "../components/Icon";

const fmt = (n) => `\u20b9${Number(n || 0).toFixed(2)}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "\u2014");
const daysBetween = (d) => Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: COLORS.success, error: COLORS.error, info: COLORS.info };
  const c = colors[type] || colors.info;
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 10, padding: "12px 20px", fontWeight: 600, fontSize: ".9rem", boxShadow: "0 4px 20px rgba(0,0,0,.15)", maxWidth: 360, display: "flex", alignItems: "center", gap: 10 }}>
      <Icon name={type === "success" ? "success" : type === "error" ? "error" : "info"} size="sm" color={type} />
      <span>{msg}</span>
      <button onClick={onClose} aria-label="Dismiss notification" style={{ background: "none", border: "none", cursor: "pointer", color: c.color, marginLeft: "auto", display: "flex", alignItems: "center" }}>
        <Icon name="close" size="sm" color={type} />
      </button>
    </div>
  );
}

function StatCard({ label, value, iconName, color, sub }) {
  return (
    <div style={{ background: COLORS.background.card, borderRadius: 14, padding: "20px 24px", boxShadow: COLORS.shadow.md, borderLeft: `4px solid ${color}`, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 48, height: 48, background: `${color}18`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={iconName} size="lg" color={color} />
      </div>
      <div>
        <div style={{ fontSize: "1.7rem", fontWeight: 800, color }}>{value}</div>
        <div style={{ fontSize: ".82rem", color: COLORS.text.secondary, fontWeight: 600 }}>{label}</div>
        {sub && <div style={{ fontSize: ".75rem", color: COLORS.text.tertiary }}>{sub}</div>}
      </div>
    </div>
  );
}

function Badge({ text, color, bg }) {
  return <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: ".72rem", fontWeight: 700, color, background: bg, whiteSpace: "nowrap" }}>{text}</span>;
}

function MedicineStatusBadges({ med }) {
  return (
    <span style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {med.isExpired && <Badge text="Expired" color="#fff" bg="#ef4444" />}
      {med.isNearExpiry && <Badge text="Near Expiry" color="#92400e" bg="#fef3c7" />}
      {med.isLowStock && <Badge text="Low Stock" color="#9a3412" bg="#ffedd5" />}
      {!med.isExpired && !med.isNearExpiry && !med.isLowStock && <Badge text="OK" color={COLORS.success.color} bg={COLORS.success.bg} />}
    </span>
  );
}

function InventoryTab({ toast }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editMed, setEditMed] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const emptyForm = { name: "", category: "", manufacturer: "", price: "", stock: "", expiryDate: "", batchNumber: "", unit: "tablets", lowStockThreshold: "10", description: "" };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterCat) params.category = filterCat;
      const r = await getMedicines(params);
      if (r.success) setMedicines(r.data);
    } catch { toast("Failed to load medicines", "error"); }
    finally { setLoading(false); }
  }, [search, filterCat, toast]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (med) => {
    setEditMed(med);
    setForm({
      name: med.name, category: med.category || "", manufacturer: med.manufacturer || "",
      price: String(med.price), stock: String(med.stock),
      expiryDate: med.expiryDate ? med.expiryDate.slice(0, 10) : "",
      batchNumber: med.batchNumber || "", unit: med.unit || "tablets",
      lowStockThreshold: String(med.lowStockThreshold || 10), description: med.description || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), lowStockThreshold: Number(form.lowStockThreshold) };
      if (editMed) {
        const res = await updateMedicine(editMed._id, payload);
        setMedicines(medicines.map(m => m._id === editMed._id ? res.data : m));
        toast("Medicine updated!", "success");
      } else {
        const res = await addMedicine(payload);
        if (!search && !filterCat) { setMedicines([...medicines, res.data]); } else { load(); }
        toast("Medicine added!", "success");
      }
      setShowForm(false); setEditMed(null); setForm(emptyForm);
    } catch (err) { toast(err.response?.data?.message || "Failed to save", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medicine?")) return;
    setDeleting(id);
    try { await deleteMedicine(id); setMedicines(medicines.filter(m => m._id !== id)); toast("Deleted!", "success"); }
    catch (err) { toast(err.response?.data?.message || "Failed to delete", "error"); }
    finally { setDeleting(null); }
  };

  const categories = [...new Set(medicines.map((m) => m.category).filter(Boolean))];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ ...s.pageTitle, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="pharmacy" size="lg" color="primary" /> Medicine Inventory
        </h2>
        <button style={s.primaryBtn} onClick={() => { setEditMed(null); setForm(emptyForm); setShowForm(true); }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="add" size="sm" color="white" /> Add Medicine</span>
        </button>
      </div>

      {medicines.filter((m) => m.isExpired).length > 0 && (
        <div style={{ ...s.alertBox, borderColor: COLORS.error.border, background: COLORS.error.bg }}>
          <Icon name="error" size="sm" color="error" />
          <strong>{medicines.filter((m) => m.isExpired).length} expired</strong> medicine(s): {medicines.filter((m) => m.isExpired).map((m) => m.name).join(", ")}
        </div>
      )}
      {medicines.filter((m) => m.isNearExpiry).length > 0 && (
        <div style={{ ...s.alertBox, borderColor: COLORS.warning.border, background: COLORS.warning.bg }}>
          <Icon name="warning" size="sm" color="warning" />
          <strong>{medicines.filter((m) => m.isNearExpiry).length} near expiry</strong>: {medicines.filter((m) => m.isNearExpiry).map((m) => `${m.name} (${daysBetween(m.expiryDate)}d)`).join(", ")}
        </div>
      )}
      {medicines.filter((m) => m.isLowStock).length > 0 && (
        <div style={s.alertBox}>
          <Icon name="package" size="sm" color="warning" />
          <strong>{medicines.filter((m) => m.isLowStock).length} low stock</strong>: {medicines.filter((m) => m.isLowStock).map((m) => `${m.name} (${m.stock})`).join(", ")}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Icon name="search" size="sm" color="muted" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input style={{ ...s.input, width: "100%", boxSizing: "border-box", paddingLeft: 34 }} placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select style={{ ...s.select, minWidth: 160 }} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {showForm && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: COLORS.text.primary }}>{editMed ? "Edit Medicine" : "Add New Medicine"}</h3>
              <button style={s.closeBtn} onClick={() => { setShowForm(false); setEditMed(null); }} aria-label="Close modal">
                <Icon name="close" size="md" color="secondary" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={s.formGrid}>
                {[
                  { label: "Medicine Name *", key: "name", placeholder: "e.g. Paracetamol 500mg" },
                  { label: "Category", key: "category", placeholder: "e.g. Analgesic" },
                  { label: "Manufacturer", key: "manufacturer", placeholder: "e.g. Cipla Ltd" },
                  { label: "Price (\u20b9) *", key: "price", type: "number", placeholder: "0.00" },
                  { label: "Stock *", key: "stock", type: "number", placeholder: "Units in stock" },
                  { label: "Low Stock Alert", key: "lowStockThreshold", type: "number", placeholder: "10" },
                  { label: "Expiry Date *", key: "expiryDate", type: "date" },
                  { label: "Batch Number", key: "batchNumber", placeholder: "e.g. B2024001" },
                ].map(({ label, key, type = "text", placeholder }) => (
                  <div key={key} style={s.field}>
                    <label style={s.label}>{label}</label>
                    <input style={s.input} type={type} placeholder={placeholder} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
                <div style={s.field}>
                  <label style={s.label}>Unit</label>
                  <select style={s.select} value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}>
                    {["tablets", "capsules", "ml", "vials", "strips", "units", "mg", "g"].map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div style={{ ...s.field, gridColumn: "1 / -1" }}>
                  <label style={s.label}>Description</label>
                  <input style={s.input} placeholder="Optional notes..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button type="submit" style={s.primaryBtn} disabled={saving}>{saving ? "Saving..." : editMed ? "Update" : "Add Medicine"}</button>
                <button type="button" style={s.ghostBtn} onClick={() => { setShowForm(false); setEditMed(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={s.tableWrap}>
        {loading ? <div style={s.center}>Loading...</div> : (
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                {["Medicine", "Category", "Manufacturer", "Price", "Stock", "Expiry", "Status", "Actions"].map((h) => <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med._id} style={{ ...s.tr, background: med.isExpired ? COLORS.error.light : med.isNearExpiry ? COLORS.warning.light : undefined }}>
                  <td style={s.td}><strong>{med.name}</strong>{med.batchNumber && <div style={{ fontSize: ".72rem", color: "#94a3b8" }}>#{med.batchNumber}</div>}</td>
                  <td style={s.td}>{med.category || "\u2014"}</td>
                  <td style={s.td}>{med.manufacturer || "\u2014"}</td>
                  <td style={s.td}><strong>{fmt(med.price)}</strong><div style={{ fontSize: ".72rem", color: "#94a3b8" }}>per {med.unit}</div></td>
                  <td style={s.td}><span style={{ fontWeight: 700, color: med.isLowStock ? "#d97706" : "#1e293b" }}>{med.stock}</span></td>
                  <td style={s.td}>
                    <span style={{ color: med.isExpired ? "#ef4444" : med.isNearExpiry ? "#d97706" : "#1e293b" }}>{fmtDate(med.expiryDate)}</span>
                    {med.isNearExpiry && <div style={{ fontSize: ".72rem", color: "#d97706" }}>{daysBetween(med.expiryDate)}d left</div>}
                  </td>
                  <td style={s.td}><MedicineStatusBadges med={med} /></td>
                  <td style={s.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={s.editBtn} onClick={() => openEdit(med)} aria-label={`Edit ${med.name}`}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="edit" size="sm" color="primary" /> Edit</span>
                      </button>
                      <button style={s.deleteBtn} onClick={() => handleDelete(med._id)} disabled={deleting === med._id} aria-label={`Delete ${med.name}`}>
                        <Icon name="delete" size="sm" color="error" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && medicines.length === 0 && <div style={s.empty}>No medicines found. Add your first medicine!</div>}
      </div>
    </div>
  );
}

function BillingTab({ toast }) {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastBill, setLastBill] = useState(null);
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [billView, setBillView] = useState("new");
  const printRef = useRef();

  useEffect(() => {
    getMedicines().then((r) => { if (r.success) setMedicines(r.data); }).catch(() => {});
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoadingSales(true);
    try { const r = await getSales(); if (r.success) setSales(r.data); }
    catch { toast("Failed to load sales", "error"); }
    finally { setLoadingSales(false); }
  };

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const q = search.toLowerCase();
    setSearchResults(medicines.filter((m) => m.name.toLowerCase().includes(q) || (m.category || "").toLowerCase().includes(q)).slice(0, 8));
  }, [search, medicines]);

  const addToCart = (med) => {
    if (med.isExpired) { toast(`"${med.name}" is expired and cannot be sold`, "error"); return; }
    setCart((prev) => {
      const existing = prev.find((i) => i.medicineId === med._id);
      if (existing) {
        if (existing.quantity >= med.stock) { toast(`Max available stock: ${med.stock}`, "error"); return prev; }
        return prev.map((i) => i.medicineId === med._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      if (med.stock < 1) { toast(`"${med.name}" is out of stock`, "error"); return prev; }
      return [...prev, { medicineId: med._id, medicineName: med.name, quantity: 1, unitPrice: med.price, maxStock: med.stock }];
    });
    setSearch(""); setSearchResults([]);
  };

  const updateQty = (id, qty) => {
    const item = cart.find((i) => i.medicineId === id);
    if (qty < 1) { removeFromCart(id); return; }
    if (qty > item.maxStock) { toast(`Max stock: ${item.maxStock}`, "error"); return; }
    setCart((prev) => prev.map((i) => i.medicineId === id ? { ...i, quantity: Number(qty) } : i));
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.medicineId !== id));

  const subtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const discountAmt = subtotal * (Number(discount) / 100);
  const total = subtotal - discountAmt;

  const handleCheckout = async () => {
    if (cart.length === 0) { toast("Cart is empty", "error"); return; }
    setSubmitting(true);
    try {
      const r = await createSale({ medicines: cart.map(({ medicineId, quantity }) => ({ medicineId, quantity })), patientName, patientPhone, paymentMethod, discount: Number(discount), notes });
      if (r.success) {
        toast("Bill created successfully!", "success");
        setLastBill(r.data);
        setCart([]); setPatientName(""); setPatientPhone(""); setDiscount(0); setNotes("");
        loadSales();
        getMedicines().then((res) => { if (res.success) setMedicines(res.data); });
      }
    } catch (err) { toast(err.response?.data?.message || "Failed to create bill", "error"); }
    finally { setSubmitting(false); }
  };

  const printBill = () => {
    const content = printRef.current?.innerHTML;
    const win = window.open("", "", "width=700,height=900");
    win.document.write(`<html><head><title>Invoice</title><style>body{font-family:monospace;padding:30px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;text-align:left}</style></head><body>${content}</body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ ...s.pageTitle, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="billing" size="lg" color="primary" /> Billing &amp; Sales
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...s.primaryBtn, background: billView === "new" ? COLORS.primary.main : COLORS.gray[100], color: billView === "new" ? "#fff" : COLORS.text.primary }} onClick={() => setBillView("new")}>New Bill</button>
          <button style={{ ...s.primaryBtn, background: billView === "history" ? COLORS.primary.main : COLORS.gray[100], color: billView === "history" ? "#fff" : COLORS.text.primary }} onClick={() => setBillView("history")}>Sales History</button>
        </div>
      </div>

      {billView === "new" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "start" }}>
          <div>
            <div style={{ ...s.card, marginBottom: 16 }}>
              <label style={s.label}>Search Medicine</label>
              <div style={{ position: "relative" }}>
                <Icon name="search" size="sm" color="muted" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input style={{ ...s.input, width: "100%", boxSizing: "border-box", paddingLeft: 34 }} placeholder="Type medicine name..." value={search} onChange={(e) => setSearch(e.target.value)} />
                {searchResults.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: COLORS.background.card, border: `1px solid ${COLORS.border.light}`, borderRadius: 8, zIndex: 100, boxShadow: COLORS.shadow.lg, maxHeight: 280, overflowY: "auto" }}>
                    {searchResults.map((med) => (
                      <div key={med._id} onClick={() => addToCart(med)} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${COLORS.border.light}`, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: med.isExpired ? 0.5 : 1 }}
                        onMouseEnter={(e) => e.currentTarget.style.background = COLORS.background.hover} onMouseLeave={(e) => e.currentTarget.style.background = COLORS.background.card}>
                        <div>
                          <strong>{med.name}</strong> <span style={{ fontSize: ".75rem", color: "#94a3b8" }}>{med.category}</span>
                          {med.isExpired && <Badge text="Expired" color="#fff" bg="#ef4444" />}
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, color: "#7c3aed" }}>{fmt(med.price)}</div>
                          <div style={{ fontSize: ".72rem", color: med.isLowStock ? "#d97706" : "#94a3b8" }}>Stock: {med.stock}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={s.card}>
              <h3 style={{ margin: "0 0 14px", color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="cart" size="md" color="primary" /> Cart ({cart.length} items)
              </h3>
              {cart.length === 0 ? <div style={s.empty}>Search and add medicines to the cart</div> : (
                <table style={s.table}>
                  <thead><tr style={s.thead}><th style={s.th}>Medicine</th><th style={s.th}>Price</th><th style={s.th}>Qty</th><th style={s.th}>Subtotal</th><th style={s.th}></th></tr></thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.medicineId} style={s.tr}>
                        <td style={s.td}>{item.medicineName}</td>
                        <td style={s.td}>{fmt(item.unitPrice)}</td>
                        <td style={s.td}><input type="number" min={1} max={item.maxStock} value={item.quantity} onChange={(e) => updateQty(item.medicineId, Number(e.target.value))} style={{ ...s.input, width: 64, padding: "4px 8px", textAlign: "center" }} /></td>
                        <td style={{ ...s.td, fontWeight: 700 }}>{fmt(item.unitPrice * item.quantity)}</td>
                        <td style={s.td}><button style={s.deleteBtn} onClick={() => removeFromCart(item.medicineId)} aria-label={`Remove ${item.medicineName}`}><Icon name="remove" size="sm" color="error" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div style={s.card}>
            <h3 style={{ margin: "0 0 16px", color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="list" size="md" color="primary" /> Bill Details
            </h3>
            <div style={s.field}><label style={s.label}>Patient Name</label><input style={s.input} placeholder="Walk-in Customer" value={patientName} onChange={(e) => setPatientName(e.target.value)} /></div>
            <div style={s.field}><label style={s.label}>Phone</label><input style={s.input} placeholder="Optional" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} /></div>
            <div style={s.field}>
              <label style={s.label}>Payment Method</label>
              <select style={s.select} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {["cash", "card", "insurance", "online"].map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div style={s.field}><label style={s.label}>Discount (%)</label><input style={s.input} type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(e.target.value)} /></div>
            <div style={s.field}><label style={s.label}>Notes</label><input style={s.input} placeholder="Any additional info..." value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16, margin: "16px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: ".9rem" }}><span>Subtotal</span><strong>{fmt(subtotal)}</strong></div>
              {Number(discount) > 0 && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: ".9rem", color: "#16a34a" }}><span>Discount ({discount}%)</span><strong>- {fmt(discountAmt)}</strong></div>}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", borderTop: "2px solid #e2e8f0", paddingTop: 8, marginTop: 4 }}><span style={{ fontWeight: 700 }}>Total</span><strong style={{ color: "#7c3aed" }}>{fmt(total)}</strong></div>
            </div>
            <button style={{ ...s.primaryBtn, width: "100%", padding: "12px", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={handleCheckout} disabled={submitting || cart.length === 0}>
              <Icon name="success" size="sm" color="white" />{submitting ? "Processing..." : "Confirm & Bill"}
            </button>
            {lastBill && (
              <div style={{ marginTop: 20, padding: 16, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ color: "#166534", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><Icon name="success" size="sm" color="success" /> Bill Generated</span>
                  <button style={{ ...s.primaryBtn, padding: "4px 10px", fontSize: ".75rem", display: "flex", alignItems: "center", gap: 5 }} onClick={printBill}><Icon name="print" size="xs" color="white" /> Print</button>
                </div>
                <div ref={printRef}>
                  <div style={{ textAlign: "center", marginBottom: 12 }}><strong>HOSPITAL PHARMACY</strong><br /><small>Invoice #{lastBill.invoiceNumber}</small><br /><small>{new Date(lastBill.createdAt).toLocaleString("en-IN")}</small></div>
                  <table style={{ width: "100%", fontSize: ".8rem", borderCollapse: "collapse" }}>
                    <thead><tr>{["Medicine", "Qty", "Price", "Sub"].map((h) => <th key={h} style={{ border: "1px solid #ccc", padding: 4 }}>{h}</th>)}</tr></thead>
                    <tbody>{lastBill.medicines.map((m, i) => <tr key={i}>{[m.medicineName, m.quantity, fmt(m.unitPrice), fmt(m.subtotal)].map((v, j) => <td key={j} style={{ border: "1px solid #ccc", padding: 4 }}>{v}</td>)}</tr>)}</tbody>
                  </table>
                  <div style={{ marginTop: 8, textAlign: "right", fontSize: ".85rem" }}>
                    <div>Subtotal: {fmt(lastBill.totalAmount)}</div>
                    {lastBill.discount > 0 && <div>Discount: -{lastBill.discount}%</div>}
                    <strong>Total: {fmt(lastBill.finalAmount)}</strong>
                  </div>
                  <div style={{ fontSize: ".75rem", marginTop: 8 }}>Patient: {lastBill.patientName} | Payment: {lastBill.paymentMethod}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {billView === "history" && (
        <div style={s.tableWrap}>
          {loadingSales ? <div style={s.center}>Loading...</div> : (
            <table style={s.table}>
              <thead><tr style={s.thead}>{["Invoice", "Patient", "Items", "Total", "Payment", "Pharmacist", "Date"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id} style={s.tr}>
                    <td style={s.td}><strong style={{ color: COLORS.primary.main }}>{sale.invoiceNumber}</strong></td>
                    <td style={s.td}>{sale.patientName}</td>
                    <td style={s.td}>{sale.medicines.length} item(s)</td>
                    <td style={s.td}><strong>{fmt(sale.finalAmount)}</strong>{sale.discount > 0 && <div style={{ fontSize: ".72rem", color: "#16a34a" }}>{sale.discount}% off</div>}</td>
                    <td style={s.td}><Badge text={sale.paymentMethod} color={COLORS.info.color} bg={COLORS.info.bg} /></td>
                    <td style={s.td}>{sale.soldBy?.name || "\u2014"}</td>
                    <td style={s.td}>{new Date(sale.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loadingSales && sales.length === 0 && <div style={s.empty}>No sales yet.</div>}
        </div>
      )}
    </div>
  );
}

function PrescriptionsTab({ toast }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [fulfilling, setFulfilling] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const r = await getPrescriptions(params);
      if (r.success) setPrescriptions(r.data);
    } catch { toast("Failed to load prescriptions", "error"); }
    finally { setLoading(false); }
  }, [filter, toast]);

  useEffect(() => { load(); }, [load]);

  const handleFulfill = async (id) => {
    if (!window.confirm("Mark this prescription as fulfilled?")) return;
    setFulfilling(id);
    try { await fulfillPrescription(id); toast("Prescription fulfilled!", "success"); load(); }
    catch (err) { toast(err.response?.data?.message || "Failed to fulfill", "error"); }
    finally { setFulfilling(null); }
  };

  const pending = prescriptions.filter((p) => p.status === "pending").length;
  const dispensed = prescriptions.filter((p) => p.status === "dispensed").length;

  return (
    <div>
      <h2 style={{ ...s.pageTitle, display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="prescription" size="lg" color="primary" /> Prescriptions
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Pending"   value={pending}              iconName="pending" color="#f59e0b" />
        <StatCard label="Dispensed" value={dispensed}            iconName="success" color="#10b981" />
        <StatCard label="Total"     value={prescriptions.length} iconName="list"    color="#6366f1" />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "pending", "dispensed"].map((f) => (
          <button key={f} style={{ ...s.primaryBtn, background: filter === f ? COLORS.primary.main : COLORS.gray[100], color: filter === f ? "#fff" : COLORS.text.primary, padding: "6px 16px" }} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div style={s.tableWrap}>
        {loading ? <div style={s.center}>Loading...</div> : (
          <table style={s.table}>
            <thead><tr style={s.thead}>{["Patient", "Medicines", "Prescribed By", "Status", "Date", "Action"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {prescriptions.map((p) => (
                <tr key={p._id} style={s.tr}>
                  <td style={s.td}><strong>{p.patientName}</strong></td>
                  <td style={s.td}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {p.medicines.map((m, i) => (
                        <span key={i} style={{ background: "#f0f4ff", color: "#4338ca", padding: "2px 8px", borderRadius: 6, fontSize: ".75rem", fontWeight: 600 }}>
                          {m.name}{m.dosage && ` (${m.dosage})`}{m.duration && ` \u00b7 ${m.duration}`}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={s.td}>{p.prescribedBy || "\u2014"}</td>
                  <td style={s.td}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, fontSize: ".72rem", fontWeight: 700, color: p.status === "pending" ? "#92400e" : "#065f46", background: p.status === "pending" ? "#fef3c7" : "#d1fae5" }}>
                      <Icon name={p.status === "pending" ? "pending" : "success"} size="xs" color={p.status === "pending" ? "warning" : "success"} />
                      {p.status === "pending" ? "Pending" : "Dispensed"}
                    </span>
                  </td>
                  <td style={s.td}>{fmtDate(p.createdAt)}</td>
                  <td style={s.td}>
                    {p.status === "pending" ? (
                      <button style={{ ...s.primaryBtn, display: "inline-flex", alignItems: "center", gap: 5 }} onClick={() => handleFulfill(p._id)} disabled={fulfilling === p._id}>
                        <Icon name="success" size="sm" color="white" />{fulfilling === p._id ? "..." : "Fulfill"}
                      </button>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: ".82rem" }}>Completed {fmtDate(p.dispensedAt)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && prescriptions.length === 0 && <div style={s.empty}>No prescriptions found.</div>}
      </div>
    </div>
  );
}

function ReportsTab({ toast }) {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    setLoading(true);
    getDailySalesReport(days)
      .then((r) => { if (r.success) setReport(r.data); })
      .catch(() => toast("Failed to load report", "error"))
      .finally(() => setLoading(false));
  }, [days, toast]);

  const totalRev = report.reduce((s, r) => s + r.totalRevenue, 0);
  const totalSales = report.reduce((s, r) => s + r.totalSales, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ ...s.pageTitle, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="reports" size="lg" color="warning" /> Sales Report
        </h2>
        <select style={{ ...s.select, width: 180 }} value={days} onChange={(e) => setDays(Number(e.target.value))}>
          {[7, 14, 30, 90].map(d => <option key={d} value={d}>Last {d} days</option>)}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Revenue" value={fmt(totalRev)}                                       iconName="revenue" color="#10b981" />
        <StatCard label="Total Bills"   value={totalSales}                                          iconName="billing" color="#6366f1" />
        <StatCard label="Avg per Bill"  value={totalSales ? fmt(totalRev / totalSales) : "\u20b90"} iconName="trending" color="#f59e0b" />
      </div>
      <div style={s.tableWrap}>
        {loading ? <div style={s.center}>Loading...</div> : (
          <table style={s.table}>
            <thead><tr style={s.thead}>{["Date", "Bills", "Revenue", "Avg Bill"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {report.map((row, i) => {
                const date = new Date(row._id.year, row._id.month - 1, row._id.day);
                return (
                  <tr key={i} style={s.tr}>
                    <td style={s.td}>{date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</td>
                    <td style={s.td}>{row.totalSales}</td>
                    <td style={{ ...s.td, fontWeight: 700, color: "#10b981" }}>{fmt(row.totalRevenue)}</td>
                    <td style={s.td}>{fmt(row.avgBillAmount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && report.length === 0 && <div style={s.empty}>No sales data for this period.</div>}
      </div>
    </div>
  );
}

export default function PharmacistDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "info") => setToast({ msg, type, id: Date.now() }), []);

  useEffect(() => { getPharmacyStats().then((r) => { if (r.success) setStats(r.data); }).catch(() => {}); }, []);

  const tabs = [
    { id: "overview",      label: "Overview",       iconName: "home"         },
    { id: "inventory",     label: "Inventory",      iconName: "pharmacy"     },
    { id: "billing",       label: "Billing",        iconName: "billing"      },
    { id: "prescriptions", label: "Prescriptions",  iconName: "prescription" },
    { id: "reports",       label: "Reports",        iconName: "reports"      },
  ];

  const quickActions = [
    { label: "Add Medicine",       tab: "inventory",     iconName: "add"          },
    { label: "New Bill",           tab: "billing",       iconName: "billing"      },
    { label: "View Prescriptions", tab: "prescriptions", iconName: "prescription" },
    { label: "Sales Report",       tab: "reports",       iconName: "reports"      },
  ];

  return (
    <div style={s.root} className="page-root">
      {toast && <Toast key={toast.id} msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <nav style={s.nav} className="page-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={s.navIcon}><Icon name="pharmacy" size="md" color="white" /></div>
          <span style={s.brand}>Hospital Pharmacy</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={s.roleTag}>Pharmacist</span>
          <div style={{ fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="user" size="sm" color="secondary" /> {user?.name}
          </div>
          <button onClick={logout} style={s.logoutBtn}>Logout</button>
        </div>
      </nav>
      <div style={s.layout} className="page-layout">
        <aside style={s.sidebar} className="page-sidebar">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ ...s.sideBtn, ...(tab === t.id ? s.sideBtnActive : {}) }}>
              <Icon name={t.iconName} size="sm" color={tab === t.id ? "white" : "#a5b4fc"} /> {t.label}
            </button>
          ))}
        </aside>
        <main style={s.main} className="page-main">
          {tab === "overview" && (
            <div>
              <h2 style={s.pageTitle}>Welcome back, {user?.name?.split(" ")[0]}!</h2>
              <p style={{ color: "#64748b", marginBottom: 24 }}>Here's your pharmacy at a glance today.</p>
              {stats ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
                  <StatCard label="Total Medicines"        value={stats.totalMedicines}       iconName="pharmacy"   color="#6366f1" />
                  <StatCard label="Today's Bills"          value={stats.todaySalesCount}       iconName="billing"    color="#10b981" sub={`Revenue: ${fmt(stats.todayRevenue)}`} />
                  <StatCard label="Pending Prescriptions"  value={stats.pendingPrescriptions}  iconName="pending"    color="#f59e0b" />
                  <StatCard label="Low Stock"              value={stats.lowStockMedicines}     iconName="lowStock"   color="#ef4444" />
                  <StatCard label="Near Expiry"            value={stats.nearExpiryMedicines}   iconName="nearExpiry" color="#f97316" sub="Within 30 days" />
                  <StatCard label="Expired"                value={stats.expiredMedicines}      iconName="expired"    color="#dc2626" />
                </div>
              ) : <div style={s.center}>Loading stats...</div>}
              <div style={{ marginTop: 28 }}>
                <h3 style={{ color: "#1e293b", marginBottom: 14 }}>Quick Actions</h3>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {quickActions.map((a) => (
                    <button key={a.tab} style={{ ...s.primaryBtn, padding: "10px 20px", display: "inline-flex", alignItems: "center", gap: 7 }} onClick={() => setTab(a.tab)}>
                      <Icon name={a.iconName} size="sm" color="white" /> {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {tab === "inventory"     && <InventoryTab toast={showToast} />}
          {tab === "billing"       && <BillingTab toast={showToast} />}
          {tab === "prescriptions" && <PrescriptionsTab toast={showToast} />}
          {tab === "reports"       && <ReportsTab toast={showToast} />}
        </main>
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: COLORS.background.main, fontFamily: "system-ui, -apple-system, sans-serif" },
  nav: { background: COLORS.background.card, padding: "0 24px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: COLORS.shadow.sm, position: "sticky", top: 0, zIndex: 200 },
  navIcon: { width: 36, height: 36, background: COLORS.primary.main, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" },
  brand: { fontWeight: 800, fontSize: "1.15rem", color: COLORS.text.primary },
  roleTag: { background: COLORS.primary.lighter, color: COLORS.primary.main, padding: "3px 12px", borderRadius: 99, fontSize: ".75rem", fontWeight: 700, border: `1px solid ${COLORS.primary.light}` },
  logoutBtn: { background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontWeight: 600, fontSize: ".85rem" },
  layout: { display: "flex", minHeight: "calc(100vh - 62px)" },
  sidebar: { width: 220, background: COLORS.primary.main, padding: "24px 12px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 },
  sideBtn: { background: "transparent", border: "none", color: "#a5b4fc", padding: "10px 14px", borderRadius: 9, cursor: "pointer", textAlign: "left", fontSize: ".9rem", fontWeight: 500, transition: "all .15s", display: "flex", alignItems: "center", gap: 9 },
  sideBtnActive: { background: COLORS.primary.light, color: "#fff" },
  main: { flex: 1, padding: 28, overflowX: "auto" },
  pageTitle: { fontSize: "1.5rem", fontWeight: 800, color: COLORS.text.primary, margin: "0 0 4px" },
  card: { background: COLORS.background.card, borderRadius: 14, padding: 20, boxShadow: COLORS.shadow.md },
  tableWrap: { background: COLORS.background.card, borderRadius: 14, overflow: "hidden", boxShadow: COLORS.shadow.md },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: COLORS.table.header },
  th: { padding: "12px 16px", textAlign: "left", fontSize: ".75rem", fontWeight: 700, color: COLORS.text.secondary, borderBottom: `1px solid ${COLORS.border.light}`, textTransform: "uppercase", letterSpacing: ".05em", whiteSpace: "nowrap" },
  tr: { borderBottom: `1px solid #f1f5f9` },
  td: { padding: "12px 16px", fontSize: ".87rem", color: COLORS.text.primary, verticalAlign: "middle" },
  alertBox: { border: `1px solid ${COLORS.warning.border}`, background: COLORS.warning.bg, borderRadius: 10, padding: "10px 16px", color: COLORS.warning.color, marginBottom: 12, fontSize: ".88rem", display: "flex", alignItems: "center", gap: 8 },
  field: { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 },
  label: { fontSize: ".8rem", fontWeight: 600, color: COLORS.gray[600] },
  input: { border: `1px solid ${COLORS.input.border}`, borderRadius: 8, padding: "9px 12px", fontSize: ".9rem", outline: "none", background: COLORS.input.bg, transition: "all .15s", cursor: "text" },
  select: { border: `1px solid ${COLORS.input.border}`, borderRadius: 8, padding: "9px 12px", fontSize: ".9rem", background: COLORS.input.bg, outline: "none", cursor: "pointer" },
  primaryBtn: { background: COLORS.primary.main, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontWeight: 600, fontSize: ".87rem", transition: "all .2s" },
  ghostBtn: { background: COLORS.gray[100], color: COLORS.gray[600], border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontWeight: 600, fontSize: ".87rem" },
  editBtn: { background: COLORS.button.secondary.bg, color: COLORS.primary.main, border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: ".8rem", fontWeight: 600 },
  deleteBtn: { background: COLORS.error.light, color: COLORS.error.color, border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modal: { background: COLORS.background.card, borderRadius: 16, padding: 28, width: "100%", maxWidth: 680, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" },
  closeBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" },
  empty: { textAlign: "center", padding: 40, color: COLORS.text.tertiary, fontSize: ".9rem" },
  center: { textAlign: "center", padding: 40, color: COLORS.text.tertiary },
};
