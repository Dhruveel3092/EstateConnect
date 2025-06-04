import React from 'react';
import { Dialog } from '@headlessui/react';

const BrokerModal = ({
  brokerList,
  brokerSearch,
  setBrokerSearch,
  selectedBrokers,
  handleBrokerSelect,
  onClose,
  isOpen,
  onConfirm,
}) => {
  const brokers = Array.isArray(brokerList) ? brokerList : [];
  const filteredBrokers = brokers.filter((broker) =>
    (broker?.username || '').toLowerCase().includes(brokerSearch.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay with blur and dark background */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-lg ring-1 ring-black/10 p-6">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-semibold text-gray-800">
                Select Brokers
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search broker..."
              value={brokerSearch}
              onChange={(e) => setBrokerSearch(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Broker List */}
            <ul className="max-h-60 overflow-y-auto mb-4 divide-y divide-gray-100">
              {filteredBrokers.map((broker) => (
                <li
                  key={broker._id}
                  onClick={() => handleBrokerSelect(broker)}
                  className={`p-2 cursor-pointer transition rounded ${
                    selectedBrokers.find((b) => b._id === broker._id)
                      ? 'bg-blue-100 text-blue-800 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {broker.username}
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default BrokerModal;
