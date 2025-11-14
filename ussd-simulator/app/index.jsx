import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Linking, Modal, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Dummy Account Data with Mobile Banking Wallets
const accounts = {
  '01': {
    name: 'Raven',
    balance: '69 TK',
    dataUsage: '999 MB',
    minuteBalance: '7 mins',
    smsBalance: '5 SMS',
    rechargeHistory: 'Last: 50 TK on 10 Nov',
    wallet: 5000 // Mobile banking wallet
  },
  '02': {
    name: 'Aungshuk',
    balance: '420 TK',
    dataUsage: '1.5 GB',
    minuteBalance: '120 mins',
    smsBalance: '50 SMS',
    rechargeHistory: 'Last: 100 TK on 12 Nov',
    wallet: 8500
  },
  '03': {
    name: 'Riz',
    balance: '777 TK',
    dataUsage: '2.3 GB',
    minuteBalance: '300 mins',
    smsBalance: '100 SMS',
    rechargeHistory: 'Last: 200 TK on 14 Nov',
    wallet: 12000
  }
};

// Submenu definitions
const submenus = {
  '*121#': {
    '1': {
      title: 'Check Balance',
      items: (account) => [
        `Account: ${account.name}`,
        `Balance: ${account.balance}`,
        '',
        'Press OK to go back'
      ]
    },
    '2': {
      title: 'My Offers',
      items: () => [
        '1. 1GB Data @ 99 TK',
        '2. 2GB Data @ 149 TK',
        '3. Unlimited Calls @ 199 TK',
        '4. Combo Pack @ 299 TK',
        '',
        'Press OK to go back'
      ]
    },
    '3': {
      title: 'Internet Packs',
      items: () => [
        '1. 500MB @ 49 TK',
        '2. 1GB @ 89 TK',
        '3. 3GB @ 199 TK',
        '4. 5GB @ 299 TK',
        '',
        'Press OK to go back'
      ]
    },
    '4': {
      title: 'Call History',
      items: () => [
        'Last 5 calls:',
        '1. +880171234567 - 5 mins',
        '2. +880189876543 - 2 mins',
        '3. +880151112222 - 10 mins',
        '4. +880163334444 - 1 min',
        '',
        'Press OK to go back'
      ]
    },
    '5': {
      title: 'Customer Service',
      items: () => [
        'Hotline: 121',
        'Email: support@carrier.com',
        'Hours: 24/7',
        '',
        'Press 1 to call',
        'Press OK to go back'
      ]
    }
  },
  '*500#': {
    '1': {
      title: 'Night Combo',
      items: () => [
        '1. 1GB (12AM-8AM) @ 19 TK',
        '2. 2GB (12AM-8AM) @ 29 TK',
        '3. Unlimited (12AM-6AM) @ 39 TK',
        '',
        'Press OK to go back'
      ]
    },
    '2': {
      title: 'Welcome Tune',
      items: () => [
        'Set caller tune:',
        '1. Latest Hits',
        '2. Romantic Songs',
        '3. Islamic Tunes',
        '4. Remove Tune',
        '',
        'Press OK to go back'
      ]
    },
    '3': {
      title: 'Voice Message',
      items: () => [
        '1. Activate Voicemail',
        '2. Check Messages',
        '3. Settings',
        '4. Deactivate',
        '',
        'Cost: 5 TK/month',
        'Press OK to go back'
      ]
    },
    '4': {
      title: 'FnF Numbers',
      items: () => [
        'Friends & Family:',
        '1. Add FnF Number',
        '2. Remove FnF',
        '3. View All FnF',
        '',
        'Up to 5 numbers free',
        'Press OK to go back'
      ]
    },
    '5': {
      title: 'Special Offers',
      items: () => [
        '1. Student Package',
        '2. Weekend Offer',
        '3. Holiday Bundle',
        '4. Eid Special',
        '',
        'Press OK to go back'
      ]
    }
  }
};

const HomeIcon = () => <Text style={styles.iconText}>🏠</Text>;
const GithubIcon = () => <Text style={styles.iconText}>⚙️</Text>;
const GlobeIcon = () => <Text style={styles.iconText}>🌐</Text>;
const MenuIcon = () => <Text style={styles.iconText}>☰</Text>;
const CloseIcon = () => <Text style={styles.iconText}>✕</Text>;

export default function USSDSimulator() {
  const [input, setInput] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [currentMenu, setCurrentMenu] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [askingForAccount, setAskingForAccount] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [selectedCode, setSelectedCode] = useState('');
  const [menuHistory, setMenuHistory] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);
  
  // Mobile banking states
  const [mobileBankingState, setMobileBankingState] = useState({
    mode: null, // 'send', 'payment', 'recharge'
    step: 0, // 0: select action, 1: enter recipient, 2: enter amount, 3: confirm
    recipient: '',
    amount: '',
    tempInput: ''
  });

  const handleKeyPress = (key) => {
    if (askingForAccount) {
      setAccountId(prev => prev + key);
    } else if (mobileBankingState.mode && mobileBankingState.step > 0) {
      // Mobile banking input handling
      setMobileBankingState(prev => ({
        ...prev,
        tempInput: prev.tempInput + key
      }));
    } else if (showResponse && currentMenu) {
      // Handle submenu navigation for *121# and *500#
      if ((selectedCode === '*121#' || selectedCode === '*500#') && submenus[selectedCode] && submenus[selectedCode][key]) {
        const submenu = submenus[selectedCode][key];
        const items = typeof submenu.items === 'function' 
          ? submenu.items(currentAccount)
          : submenu.items;
        
        setMenuHistory([...menuHistory, currentMenu]);
        setCurrentMenu({
          title: submenu.title,
          items: items,
          isSubmenu: true
        });
      } else if (selectedCode === '*999#') {
        // Mobile banking menu navigation
        handleMobileBankingNavigation(key);
      }
    } else {
      setInput(prev => prev + key);
    }
  };

  const handleMobileBankingNavigation = (key) => {
    const state = mobileBankingState;

    if (state.mode === null) {
      // Main mobile banking menu
      if (key === '1') {
        setMobileBankingState({
          mode: 'send',
          step: 1,
          recipient: '',
          amount: '',
          tempInput: ''
        });
        setCurrentMenu({
          title: 'Send Money',
          items: [
            'Enter recipient account ID',
            '(01, 02, or 03)',
            '',
            `Current input: _`
          ],
          isSubmenu: true
        });
      } else if (key === '3') {
        setMobileBankingState({
          mode: 'payment',
          step: 1,
          recipient: '',
          amount: '',
          tempInput: ''
        });
        setCurrentMenu({
          title: 'Make Payment',
          items: [
            'Enter payee account ID',
            '(01, 02, or 03)',
            '',
            `Current input: _`
          ],
          isSubmenu: true
        });
      } else if (key === '4') {
        setMobileBankingState({
          mode: 'recharge',
          step: 1,
          recipient: '',
          amount: '',
          tempInput: ''
        });
        setCurrentMenu({
          title: 'Mobile Recharge',
          items: [
            'Enter mobile account ID',
            '(01, 02, or 03)',
            '',
            `Current input: _`
          ],
          isSubmenu: true
        });
      } else if (key === '5') {
        // Check wallet balance
        setCurrentMenu({
          title: 'Mobile Banking Wallet',
          items: [
            `Account: ${currentAccount.name}`,
            `Wallet Balance: ${currentAccount.wallet} TK`,
            '',
            'Press OK to go back'
          ],
          isSubmenu: true
        });
      }
    }
  };

  const handleMobileBankingOk = () => {
    const state = mobileBankingState;

    if (state.step === 1) {
      // Recipient entered
      const recipient = state.tempInput;
      if (accounts[recipient] && recipient !== accountId) {
        setMobileBankingState({
          ...state,
          step: 2,
          recipient: recipient,
          tempInput: ''
        });
        setCurrentMenu({
          title: state.mode === 'send' ? 'Send Money' : state.mode === 'payment' ? 'Make Payment' : 'Mobile Recharge',
          items: [
            `To: ${accounts[recipient].name} (${recipient})`,
            '',
            'Enter amount (TK):',
            `Current input: _`
          ],
          isSubmenu: true
        });
      } else {
        setCurrentMenu({
          title: 'Error',
          items: [
            'Invalid account ID',
            'Cannot send to yourself',
            '',
            'Press OK to go back'
          ],
          isSubmenu: true
        });
        setMobileBankingState({
          mode: null,
          step: 0,
          recipient: '',
          amount: '',
          tempInput: ''
        });
      }
    } else if (state.step === 2) {
      // Amount entered
      const amount = parseInt(state.tempInput);
      if (amount > 0 && amount <= currentAccount.wallet) {
        setMobileBankingState({
          ...state,
          step: 3,
          amount: amount.toString()
        });
        setCurrentMenu({
          title: 'Confirm Transaction',
          items: [
            `Type: ${state.mode === 'send' ? 'Send Money' : state.mode === 'payment' ? 'Payment' : 'Recharge'}`,
            `To: ${accounts[state.recipient].name}`,
            `Amount: ${amount} TK`,
            `Fee: 0 TK`,
            `Total: ${amount} TK`,
            '',
            'Press OK to confirm',
            'Press Home to cancel'
          ],
          isSubmenu: true
        });
      } else {
        setCurrentMenu({
          title: 'Error',
          items: [
            'Invalid amount',
            `Wallet balance: ${currentAccount.wallet} TK`,
            '',
            'Press OK to go back'
          ],
          isSubmenu: true
        });
        setMobileBankingState({
          mode: null,
          step: 0,
          recipient: '',
          amount: '',
          tempInput: ''
        });
      }
    } else if (state.step === 3) {
      // Confirm transaction
      const amount = parseInt(state.amount);
      accounts[accountId].wallet -= amount;
      accounts[state.recipient].wallet += amount;
      
      if (state.mode === 'recharge') {
        // Also update mobile balance
        const currentBalance = parseInt(accounts[state.recipient].balance);
        accounts[state.recipient].balance = `${currentBalance + amount} TK`;
      }

      setCurrentMenu({
        title: 'Success!',
        items: [
          `${state.mode === 'send' ? 'Money sent' : state.mode === 'payment' ? 'Payment made' : 'Recharge successful'}`,
          `To: ${accounts[state.recipient].name}`,
          `Amount: ${amount} TK`,
          `New wallet: ${accounts[accountId].wallet} TK`,
          '',
          'Press OK to go back'
        ],
        isSubmenu: true
      });
      
      setMobileBankingState({
        mode: null,
        step: 0,
        recipient: '',
        amount: '',
        tempInput: ''
      });
    }
  };

  const handleDelete = () => {
    if (askingForAccount) {
      setAccountId(prev => prev.slice(0, -1));
    } else if (mobileBankingState.mode && mobileBankingState.step > 0) {
      setMobileBankingState(prev => ({
        ...prev,
        tempInput: prev.tempInput.slice(0, -1)
      }));
      // Update display
      const currentTitle = currentMenu.title;
      const items = [...currentMenu.items];
      items[items.length - 1] = `Current input: ${mobileBankingState.tempInput.slice(0, -1) || '_'}`;
      setCurrentMenu({
        ...currentMenu,
        items: items
      });
    } else {
      setInput(prev => prev.slice(0, -1));
    }
  };

  const handleCall = () => {
    if (askingForAccount) {
      // Validate account
      if (accounts[accountId]) {
        const account = accounts[accountId];
        setCurrentAccount(account);
        
        let items = [];
        if (selectedCode === '*121#') {
          items = [
            `Account: ${account.name} (ID: ${accountId})`,
            `Balance: ${account.balance}`,
            '---',
            '1. Check Balance',
            '2. My Offers',
            '3. Internet Packs',
            '4. Call History',
            '5. Customer Service'
          ];
        } else if (selectedCode === '*999#') {
          items = [
            `Account: ${account.name} (ID: ${accountId})`,
            `Wallet: ${account.wallet} TK`,
            '---',
            '1. Send Money',
            '2. Cash Out (Coming Soon)',
            '3. Make Payment',
            '4. Mobile Recharge',
            '5. Check Wallet Balance'
          ];
        }
        
        setCurrentMenu({
          title: selectedCode === '*121#' ? 'Main Menu' : 'Mobile Banking',
          items: items
        });
        setShowResponse(true);
        setAskingForAccount(false);
      } else {
        setCurrentMenu({
          title: 'Error',
          items: ['Invalid Account ID', 'Please try: 01, 02, or 03']
        });
        setShowResponse(true);
        setAskingForAccount(false);
        setAccountId('');
      }
    } else if (currentMenu && currentMenu.isSubmenu) {
      // In submenu, OK goes back or processes mobile banking
      handleOkPress();
    } else {
      // Initial call
      if (input === '*121#' || input === '*999#') {
        setSelectedCode(input);
        setAskingForAccount(true);
        setAccountId('');
      } else if (input === '*500#') {
        setCurrentMenu({
          title: 'Promotional Offers',
          items: [
            '1. Night Combo',
            '2. Welcome Tune',
            '3. Voice Message',
            '4. FnF Numbers',
            '5. Special Offers'
          ]
        });
        setShowResponse(true);
        setSelectedCode(input);
      } else if (input === '*123#') {
        setCurrentMenu({
          title: 'Data Packages',
          items: [
            '1. Daily Packs',
            '2. Weekly Packs',
            '3. Monthly Packs',
            '4. Social Media Packs',
            '5. Gaming Packs'
          ]
        });
        setShowResponse(true);
        setSelectedCode(input);
      } else {
        setCurrentMenu({
          title: 'Invalid Code',
          items: ['The USSD code you entered is not recognized.', 'Please try again with a valid code.']
        });
        setShowResponse(true);
      }
    }
  };

  const handleOkPress = () => {
    // Mobile banking transaction processing
    if (mobileBankingState.mode && mobileBankingState.step > 0) {
      handleMobileBankingOk();
      return;
    }

    if (currentMenu && currentMenu.isSubmenu && menuHistory.length > 0) {
      // Go back to previous menu
      const previousMenu = menuHistory[menuHistory.length - 1];
      setMenuHistory(menuHistory.slice(0, -1));
      setCurrentMenu(previousMenu);
      setMobileBankingState({
        mode: null,
        step: 0,
        recipient: '',
        amount: '',
        tempInput: ''
      });
    } else if (showResponse) {
      // Go back to dialer
      handleBack();
    } else {
      // Call
      handleCall();
    }
  };

  const handleBack = () => {
    setShowResponse(false);
    setCurrentMenu(null);
    setInput('');
    setAskingForAccount(false);
    setAccountId('');
    setSelectedCode('');
    setMenuHistory([]);
    setCurrentAccount(null);
    setMobileBankingState({
      mode: null,
      step: 0,
      recipient: '',
      amount: '',
      tempInput: ''
    });
  };

  const handleHome = () => {
    handleBack();
  };

  // Update display when typing in mobile banking
  React.useEffect(() => {
    if (mobileBankingState.mode && mobileBankingState.step > 0 && mobileBankingState.step < 3) {
      const currentTitle = currentMenu.title;
      const items = [...currentMenu.items];
      items[items.length - 1] = `Current input: ${mobileBankingState.tempInput || '_'}`;
      setCurrentMenu({
        ...currentMenu,
        items: items
      });
    }
  }, [mobileBankingState.tempInput]);

  const NumpadButton = ({ number, letters, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.numpadButton}
      activeOpacity={0.7}
    >
      <Text style={styles.numpadNumber}>{number}</Text>
      {letters && <Text style={styles.numpadLetters}>{letters}</Text>}
    </TouchableOpacity>
  );

  const DPadButton = ({ direction, onPress, style }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.dpadButton, style]}
      activeOpacity={0.7}
    >
      <Text style={styles.dpadArrow}>{direction}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Sidebar Modal */}
      <Modal
        visible={sidebarOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSidebarOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            activeOpacity={1} 
            onPress={() => setSidebarOpen(false)}
          />
          <View style={styles.sidebar}>
            {/* Sidebar Header with Nokia Theme */}
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>MENU: CROW1100</Text>
              <TouchableOpacity onPress={() => setSidebarOpen(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sidebarContent}>
              {/* Home Button */}
              <TouchableOpacity
                onPress={() => {
                  handleBack();
                  setSidebarOpen(false);
                }}
                style={styles.sidebarHomeButton}
              >
                <Text style={styles.sidebarHomeIcon}>🏠</Text>
                <Text style={styles.sidebarHomeText}>Home Screen</Text>
              </TouchableOpacity>

              {/* About Section */}
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>📱 ABOUT APP</Text>
                <View style={styles.sidebarCard}>
                  <Text style={styles.sidebarCardText}>
                    USSD Simulator mimics feature phone USSD menu systems used by mobile carriers.
                  </Text>
                  <Text style={styles.sidebarCardText}>
                    Navigate using the D-Pad and OK button just like classic Nokia phones!
                  </Text>
                </View>
              </View>

              {/* Test Accounts */}
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>👤 TEST ACCOUNTS</Text>
                <View style={styles.accountCard}>
                  <Text style={styles.accountTitle}>Account 01 - RAVEN</Text>
                  <Text style={styles.accountDetail}>Balance: 69 TK</Text>
                  <Text style={styles.accountDetail}>Wallet: 5000 TK</Text>
                  <Text style={styles.accountDetail}>Data: 999 MB</Text>
                </View>
                <View style={styles.accountCard}>
                  <Text style={styles.accountTitle}>Account 02 - Aungshuk</Text>
                  <Text style={styles.accountDetail}>Balance: 420 TK</Text>
                  <Text style={styles.accountDetail}>Wallet: 8500 TK</Text>
                  <Text style={styles.accountDetail}>Data: 1.5 GB</Text>
                </View>
                <View style={styles.accountCard}>
                  <Text style={styles.accountTitle}>Account 03 - Riz</Text>
                  <Text style={styles.accountDetail}>Balance: 777 TK</Text>
                  <Text style={styles.accountDetail}>Wallet: 12000 TK</Text>
                  <Text style={styles.accountDetail}>Data: 2.3 GB</Text>
                </View>
              </View>

              {/* USSD Codes */}
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>🔢 USSD CODES</Text>
                <View style={styles.ussdCard}>
                  <Text style={styles.ussdCode}>*121#</Text>
                  <Text style={styles.ussdDesc}>Main Menu (requires account)</Text>
                </View>
                <View style={styles.ussdCard}>
                  <Text style={styles.ussdCode}>*500#</Text>
                  <Text style={styles.ussdDesc}>Promotional Offers</Text>
                </View>
                <View style={styles.ussdCard}>
                  <Text style={styles.ussdCode}>*999#</Text>
                  <Text style={styles.ussdDesc}>Mobile Banking (requires account)</Text>
                </View>
                <View style={styles.ussdCard}>
                  <Text style={styles.ussdCode}>*123#</Text>
                  <Text style={styles.ussdDesc}>Data Packages</Text>
                </View>
              </View>

              {/* Links Section */}
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>🔗 LINKS</Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL('https://github.com/tahmidraven')}
                  style={styles.linkCard}
                >
                  <Text style={styles.linkIcon}>⚙️</Text>
                  <View style={styles.linkTextContainer}>
                    <Text style={styles.linkTitle}>GitHub</Text>
                    <Text style={styles.linkUrl}>github.com/tahmidraven</Text>
                  </View>
                </TouchableOpacity>
                {/* <TouchableOpacity
                  onPress={() => Linking.openURL('https://tahmidraven.online')}
                  style={styles.linkCard}
                >
                  <Text style={styles.linkIcon}>🌐</Text>
                  <View style={styles.linkTextContainer}>
                    <Text style={styles.linkTitle}>Website</Text>
                    <Text style={styles.linkUrl}>tahmidraven.online</Text>
                  </View>
                </TouchableOpacity> */}
              </View>

              {/* Footer */}
              <View style={styles.sidebarFooter}>
                <Text style={styles.footerBrand}>NOKIA CROW1100</Text>
                <Text style={styles.footerText}>© Raven</Text>
                <Text style={styles.footerYear}>2025</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Menu Button */}
      <TouchableOpacity
        onPress={() => setSidebarOpen(true)}
        style={styles.menuButton}
      >
        <MenuIcon />
      </TouchableOpacity>

      {/* Feature Phone Body */}
      <View style={styles.phoneBody}>
        {/* Phone Brand */}
        <View style={styles.phoneBrand}>
          <Text style={styles.brandText}>NOKIA CROW1100</Text>
        </View>

        {/* Screen */}
        <View style={styles.screen}>
          <View style={styles.screenInner}>
            {askingForAccount ? (
              <View style={styles.screenContent}>
                <Text style={styles.screenTitle}>Enter Account ID</Text>
                <View style={styles.screenInputArea}>
                  <Text style={styles.screenInput}>{accountId || '_'}</Text>
                </View>
                <Text style={styles.screenHint}>Try: 01, 02, or 03</Text>
              </View>
            ) : !showResponse ? (
              <View style={styles.screenContent}>
                <Text style={styles.screenTitle}>Enter USSD Code</Text>
                <View style={styles.screenInputArea}>
                  <Text style={styles.screenInput}>{input || '_'}</Text>
                </View>
                <Text style={styles.screenHint}>*121# *500# *999# *123#</Text>
              </View>
            ) : (
              <View style={styles.screenContent}>
                <Text style={styles.screenTitle}>{currentMenu?.title}</Text>
                <ScrollView style={styles.screenMenuList}>
                  {currentMenu?.items.map((item, index) => (
                    <Text key={index} style={styles.screenMenuItem}>{item}</Text>
                  ))}
                </ScrollView>
                {!currentMenu?.isSubmenu && mobileBankingState.mode === null && (
                  <Text style={styles.screenHint}>Press 1-5 for options</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* D-Pad Navigation with surrounding buttons */}
        <View style={styles.navigationArea}>
          {/* Top Row: Unlock, Up, Home */}
          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={() => {}}
              style={[styles.actionBtn, styles.unlockBtn]}
              activeOpacity={0.7}
            >
              <Text style={styles.actionBtnIcon}>🔓</Text>
            </TouchableOpacity>
            <DPadButton direction="▲" onPress={() => {}} style={styles.dpadUp} />
            <TouchableOpacity
              onPress={handleHome}
              style={[styles.actionBtn, styles.homeBtn]}
              activeOpacity={0.7}
            >
              <Text style={styles.actionBtnIcon}>🏠</Text>
            </TouchableOpacity>
          </View>

          {/* Middle Row: Left, OK, Right */}
          <View style={styles.navRow}>
            <DPadButton direction="◀" onPress={() => {}} style={styles.dpadLeft} />
            <TouchableOpacity
              onPress={handleOkPress}
              style={styles.dpadOk}
              activeOpacity={0.7}
            >
              <Text style={styles.dpadOkText}>OK</Text>
            </TouchableOpacity>
            <DPadButton direction="▶" onPress={() => {}} style={styles.dpadRight} />
          </View>

          {/* Bottom Row: Call, Down, Clear */}
          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={handleCall}
              style={[styles.actionBtn, styles.callBtn]}
              activeOpacity={0.7}
            >
              <Text style={styles.actionBtnIcon}>📞</Text>
            </TouchableOpacity>
            <DPadButton direction="▼" onPress={() => {}} style={styles.dpadDown} />
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.actionBtn, styles.clearBtn]}
              activeOpacity={0.7}
            >
              <Text style={styles.actionBtnIcon}>✖</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Number Pad */}
        <View style={styles.numpad}>
          <NumpadButton number="1" letters="" onPress={() => handleKeyPress('1')} />
          <NumpadButton number="2" letters="ABC" onPress={() => handleKeyPress('2')} />
          <NumpadButton number="3" letters="DEF" onPress={() => handleKeyPress('3')} />
          
          <NumpadButton number="4" letters="GHI" onPress={() => handleKeyPress('4')} />
          <NumpadButton number="5" letters="JKL" onPress={() => handleKeyPress('5')} />
          <NumpadButton number="6" letters="MNO" onPress={() => handleKeyPress('6')} />
          
          <NumpadButton number="7" letters="PQRS" onPress={() => handleKeyPress('7')} />
          <NumpadButton number="8" letters="TUV" onPress={() => handleKeyPress('8')} />
          <NumpadButton number="9" letters="WXYZ" onPress={() => handleKeyPress('9')} />
          
          <NumpadButton number="*" letters="+" onPress={() => handleKeyPress('*')} />
          <NumpadButton number="0" letters="SPACE" onPress={() => handleKeyPress('0')} />
          <NumpadButton number="#" letters="" onPress={() => handleKeyPress('#')} />
        </View>

        {/* Speaker Grill */}
        <View style={styles.speakerGrill}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={styles.speakerHole} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  sidebar: {
    width: 320,
    backgroundColor: '#1A1A1A',
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0A3D0A',
    borderBottomWidth: 3,
    borderBottomColor: '#27AE60',
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7FB77E',
    letterSpacing: 2,
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#2C2C2C',
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFF',
  },
  sidebarContent: {
    flex: 1,
    padding: 20,
  },
  sidebarHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498DB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  sidebarHomeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sidebarHomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  sidebarSection: {
    marginBottom: 24,
  },
  sidebarSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#7FB77E',
    marginBottom: 12,
    letterSpacing: 1,
  },
  sidebarCard: {
    backgroundColor: '#2C2C2C',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#27AE60',
  },
  sidebarCardText: {
    fontSize: 13,
    color: '#CCC',
    marginBottom: 8,
    lineHeight: 18,
  },
  accountCard: {
    backgroundColor: '#2C2C2C',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3498DB',
  },
  accountTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6,
  },
  accountDetail: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: 2,
  },
  ussdCard: {
    backgroundColor: '#2C2C2C',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#F39C12',
  },
  ussdCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F39C12',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  ussdDesc: {
    fontSize: 12,
    color: '#AAA',
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#E74C3C',
  },
  linkIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  linkTextContainer: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  linkUrl: {
    fontSize: 12,
    color: '#888',
  },
  sidebarFooter: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
  },
  footerBrand: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7FB77E',
    letterSpacing: 4,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  footerYear: {
    fontSize: 11,
    color: '#555',
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#34495E',
    borderRadius: 25,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  iconText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  phoneBody: {
    width: 300,
    backgroundColor: '#1A1A1A',
    borderRadius: 35,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  phoneBrand: {
    alignItems: 'center',
    marginBottom: 12,
  },
  brandText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: 3,
  },
  screen: {
    backgroundColor: '#0A3D0A',
    borderRadius: 8,
    padding: 3,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#333',
  },
  screenInner: {
    backgroundColor: '#7FB77E',
    borderRadius: 6,
    padding: 10,
    minHeight: 140,
  },
  screenContent: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0A3D0A',
    marginBottom: 8,
    textAlign: 'center',
  },
  screenInputArea: {
    backgroundColor: '#6DA56C',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenInput: {
    fontSize: 20,
    fontFamily: 'monospace',
    color: '#0A3D0A',
    fontWeight: 'bold',
  },
  screenHint: {
    fontSize: 9,
    color: '#0A3D0A',
    textAlign: 'center',
  },
  screenMenuList: {
    maxHeight: 100,
  },
  screenMenuItem: {
    fontSize: 10,
    color: '#0A3D0A',
    marginBottom: 4,
    fontWeight: '500',
  },
  navigationArea: {
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 5,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  dpadButton: {
    width: 55,
    height: 42,
    backgroundColor: '#2C2C2C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  dpadUp: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  dpadDown: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  dpadLeft: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  dpadRight: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  dpadArrow: {
    fontSize: 18,
    color: '#AAA',
  },
  dpadOk: {
    width: 60,
    height: 60,
    backgroundColor: '#444',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#666',
    marginHorizontal: 3,
  },
  dpadOkText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
  },
  actionBtn: {
    width: 55,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  unlockBtn: {
    backgroundColor: '#F39C12',
  },
  homeBtn: {
    backgroundColor: '#3498DB',
  },
  callBtn: {
    backgroundColor: '#27AE60',
  },
  clearBtn: {
    backgroundColor: '#E74C3C',
  },
  actionBtnIcon: {
    fontSize: 18,
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  numpadButton: {
    width: '30%',
    aspectRatio: 1.1,
    backgroundColor: '#2C2C2C',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  numpadNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  numpadLetters: {
    fontSize: 8,
    color: '#888',
    marginTop: -2,
  },
  speakerGrill: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  speakerHole: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#444',
  },
});