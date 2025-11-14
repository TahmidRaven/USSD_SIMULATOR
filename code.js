import React, { useState } from 'react';
import { Home, Github, Globe, Menu, X } from 'lucide-react';

// USSD Menu Data
const ussdMenus = {
  '*121#': {
    title: 'Main Menu',
    items: [
      '1. Check Balance',
      '2. My Offers',
      '3. Internet Packs',
      '4. Call History',
      '5. Customer Service'
    ]
  },
  '*500#': {
    title: 'Balance & Usage',
    items: [
      '1. Account Balance',
      '2. Data Usage',
      '3. Minute Balance',
      '4. SMS Balance',
      '5. Recharge History'
    ]
  },
  '*999#': {
    title: 'Mobile Banking',
    items: [
      '1. Send Money',
      '2. Cash Out',
      '3. Payment',
      '4. Mobile Recharge',
      '5. Check Balance'
    ]
  },
  '*123#': {
    title: 'Promotional Offers',
    items: [
      '1. Data Packages',
      '2. Voice Bundles',
      '3. SMS Packs',
      '4. Combo Offers',
      '5. Night Packs'
    ]
  }
};

export default function USSDSimulator() {
  const [input, setInput] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [currentMenu, setCurrentMenu] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleKeyPress = (key) => {
    setInput(prev => prev + key);
  };

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (ussdMenus[input]) {
      setCurrentMenu(ussdMenus[input]);
      setShowResponse(true);
    } else {
      setCurrentMenu({
        title: 'Invalid Code',
        items: ['The USSD code you entered is not recognized.', 'Please try again with a valid code.']
      });
      setShowResponse(true);
    }
  };

  const handleBack = () => {
    setShowResponse(false);
    setCurrentMenu(null);
    setInput('');
  };

  const KeypadButton = ({ value, onPress, span = false }) => (
    <button
      onClick={onPress}
      className={`${span ? 'col-span-2' : ''} bg-gradient-to-b from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 active:from-gray-300 active:to-gray-400 rounded-xl h-16 flex items-center justify-center text-2xl font-semibold text-gray-800 shadow-md transition-all duration-150 border border-gray-300`}
    >
      {value}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Menu</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <button
              onClick={() => {
                handleBack();
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Home size={24} className="text-blue-600" />
              <span className="text-lg font-medium text-gray-800">Home</span>
            </button>

            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">About</h3>
              <div className="space-y-3 text-gray-700">
                <p className="text-sm leading-relaxed">
                  USSD Simulator is a mobile app that mimics USSD menu systems used by mobile carriers and service providers.
                </p>
                <p className="text-sm leading-relaxed">
                  Enter codes like *121#, *500#, or *999# to explore different menu options.
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Links</h3>
              <div className="space-y-3">
                <a
                  href="https://github.com/tahmidraven"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Github size={20} className="text-gray-700" />
                  <span className="text-gray-800">GitHub Profile</span>
                </a>
                <a
                  href="https://tahmidraven.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Globe size={20} className="text-gray-700" />
                  <span className="text-gray-800">Visit Website</span>
                </a>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="text-xs text-gray-500 text-center">
                Made by Tahmid Raven
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="w-full max-w-md">
        {/* Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-4 left-4 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow z-30"
        >
          <Menu size={24} className="text-gray-700" />
        </button>

        {/* Phone Container */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 text-center">
            <h1 className="text-2xl font-bold">USSD Simulator</h1>
            <p className="text-blue-100 text-sm mt-1">Mobile Service Menu</p>
          </div>

          {/* Main Screen */}
          {!showResponse ? (
            <div className="p-6 space-y-6">
              {/* Display Input */}
              <div className="bg-gray-50 rounded-2xl p-6 min-h-20 flex items-center justify-center border-2 border-gray-200">
                <input
                  type="text"
                  value={input}
                  readOnly
                  placeholder="Enter USSD code"
                  className="text-3xl font-mono text-center w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <KeypadButton
                    key={num}
                    value={num}
                    onPress={() => handleKeyPress(num.toString())}
                  />
                ))}
                <KeypadButton value="*" onPress={() => handleKeyPress('*')} />
                <KeypadButton value="0" onPress={() => handleKeyPress('0')} />
                <KeypadButton value="#" onPress={() => handleKeyPress('#')} />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-14 font-semibold shadow-md transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={handleCall}
                  disabled={!input}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl h-14 font-semibold shadow-md transition-colors"
                >
                  Call
                </button>
              </div>

              {/* Hints */}
              <div className="text-center text-sm text-gray-500 space-y-1">
                <p>Try these codes:</p>
                <p className="font-mono">*121# | *500# | *999# | *123#</p>
              </div>
            </div>
          ) : (
            /* Response Screen */
            <div className="p-6 space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">{currentMenu?.title}</h2>
                <p className="text-sm text-gray-500 font-mono mt-1">{input}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 max-h-96 overflow-y-auto">
                {currentMenu?.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                  >
                    <p className="text-gray-800">{item}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleBack}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-xl h-14 font-semibold shadow-md transition-colors"
              >
                Back to Dialer
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          <p>Tap the menu icon to learn more</p>
        </div>
      </div>
    </div>
  );
}