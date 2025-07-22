import React, { useState } from "react";
import { SquarePen, Trash2, Hand } from "lucide-react";

export default function MedicineTable() {
  const [items, setItems] = useState([
    { id: 1, name: "Paracetamol", qty: 10 },
    { id: 2, name: "Ibuprofen", qty: 5 },
  ]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState({});
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [dispenseItem, setDispenseItem] = useState({});
  const [dispenseQty, setDispenseQty] = useState(0);

  const handleUpdate = (updatedItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  return (
    <div className="p-4">
      <table className="w-full table-auto border text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Quantity</th>
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="px-3 py-2">{item.name}</td>
              <td className="px-3 py-2">{item.qty}</td>
              <td className="px-3 py-2 flex gap-3">
                <SquarePen
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                  onClick={() => {
                    setEditItem(item);
                    setShowEditModal(true);
                  }}
                />
                <Trash2
                  className="w-4 h-4 text-red-600 cursor-pointer"
                  onClick={() =>
                    setItems((prev) => prev.filter((i) => i.id !== item.id))
                  }
                />
                <Hand
                  className="w-4 h-4 text-green-600 cursor-pointer"
                  onClick={() => {
                    setDispenseItem(item);
                    setDispenseQty(0);
                    setShowDispenseModal(true);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Edit Item</h2>
            <label className="block mb-2">
              Name:
              <input
                type="text"
                className="w-full border p-2 rounded mt-1"
                value={editItem.name}
                onChange={(e) =>
                  setEditItem({ ...editItem, name: e.target.value })
                }
              />
            </label>
            <label className="block mb-2">
              Quantity:
              <input
                type="number"
                className="w-full border p-2 rounded mt-1"
                value={editItem.qty}
                onChange={(e) =>
                  setEditItem({ ...editItem, qty: Number(e.target.value) })
                }
              />
            </label>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdate(editItem);
                  setShowEditModal(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispense Modal */}
      {showDispenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Dispense Item</h2>
            <p className="mb-2">
              Item: <strong>{dispenseItem.name}</strong>
            </p>
            <label className="block mb-4">
              Quantity to Dispense:
              <input
                type="number"
                className="w-full border p-2 rounded mt-1"
                value={dispenseQty}
                onChange={(e) => setDispenseQty(Number(e.target.value))}
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDispenseModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (dispenseQty > 0 && dispenseQty <= dispenseItem.qty) {
                    const updated = {
                      ...dispenseItem,
                      qty: dispenseItem.qty - dispenseQty,
                    };
                    handleUpdate(updated);
                    setShowDispenseModal(false);
                  } else {
                    alert("Invalid quantity to dispense");
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
