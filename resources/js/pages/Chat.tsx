// resources/js/pages/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import {
    Bell,
    User,
    LayoutDashboard,
    Archive,
    FileText,
    History,
    ShieldQuestion,
    Search,
    Printer,
    GraduationCap,
    Briefcase,
    ChevronDown,
    Menu,
    Send,
    Paperclip,
    MoreVertical,
    Phone,
    Video,
    X,
    Check,
    CheckCheck
} from 'lucide-react';

interface Contact {
    id: string;
    name: string;
    role: string;
    avatar: string;
    status: 'online' | 'offline' | 'away';
    lastSeen?: string;
    isTyping?: boolean;
}

interface Message {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
    attachments?: Attachment[];
}

interface Attachment {
    id: string;
    name: string;
    type: 'image' | 'document' | 'pdf';
    url: string;
}

interface Conversation {
    contactId: string;
    messages: Message[];
    unreadCount: number;
}

const Chat: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    
    // Chat states
    const [contacts, setContacts] = useState<Contact[]>([
        {
            id: '1',
            name: 'Dr. Maria Santos',
            role: 'Doctor',
            avatar: '/avatars/doctor1.png',
            status: 'online',
            lastSeen: 'Online'
        },
        {
            id: '2',
            name: 'Nurse John Doe',
            role: 'Nurse',
            avatar: '/avatars/nurse1.png',
            status: 'online',
            lastSeen: 'Online'
        },
        {
            id: '3',
            name: 'Dr. Roberto Garcia',
            role: 'Doctor',
            avatar: '/avatars/doctor2.png',
            status: 'away',
            lastSeen: '2 hours ago'
        },
        {
            id: '4',
            name: 'Nurse Emily Chen',
            role: 'Nurse',
            avatar: '/avatars/nurse2.png',
            status: 'offline',
            lastSeen: '5 hours ago'
        },
        {
            id: '5',
            name: 'Dr. Carlos Rivera',
            role: 'Doctor',
            avatar: '/avatars/doctor3.png',
            status: 'online',
            lastSeen: 'Online'
        }
    ]);
    
    const [conversations, setConversations] = useState<Conversation[]>([
        {
            contactId: '1',
            messages: [
                {
                    id: '1',
                    senderId: '1',
                    recipientId: 'current',
                    content: 'Hi there! How\'s the patient doing today?',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    status: 'read'
                },
                {
                    id: '2',
                    senderId: 'current',
                    recipientId: '1',
                    content: 'Doing well! Vitals are stable and medication is working.',
                    timestamp: new Date(Date.now() - 3500000).toISOString(),
                    status: 'read'
                },
                {
                    id: '3',
                    senderId: '1',
                    recipientId: 'current',
                    content: 'Great to hear! Any concerns I should be aware of?',
                    timestamp: new Date(Date.now() - 3400000).toISOString(),
                    status: 'read'
                },
                {
                    id: '4',
                    senderId: 'current',
                    recipientId: '1',
                    content: 'Just the usual follow-up needed next week. I\'ll send the schedule.',
                    timestamp: new Date(Date.now() - 3300000).toISOString(),
                    status: 'read'
                },
                {
                    id: '5',
                    senderId: '1',
                    recipientId: 'current',
                    content: 'Perfect, thanks! See you tomorrow at the meeting.',
                    timestamp: new Date(Date.now() - 3200000).toISOString(),
                    status: 'read'
                }
            ],
            unreadCount: 0
        },
        {
            contactId: '2',
            messages: [
                {
                    id: '6',
                    senderId: '2',
                    recipientId: 'current',
                    content: 'Can you review the patient file I sent?',
                    timestamp: new Date(Date.now() - 86400000).toISOString(),
                    status: 'delivered'
                }
            ],
            unreadCount: 1
        }
    ]);
    
    const [activeContact, setActiveContact] = useState<Contact>(contacts[0]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingContact, setTypingContact] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        router.post('/logout');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // Auto-scroll to bottom of messages
    useEffect(() => {
        scrollToBottom();
    }, [conversations, activeContact]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Simulate typing indicator
    useEffect(() => {
        let typingTimer: NodeJS.Timeout;
        if (isTyping) {
            typingTimer = setTimeout(() => {
                setIsTyping(false);
            }, 3000);
        }
        return () => clearTimeout(typingTimer);
    }, [isTyping]);

    // Get active conversation
    const getActiveConversation = (): Conversation | undefined => {
        return conversations.find(conv => conv.contactId === activeContact.id);
    };

    // Get contact by ID
    const getContactById = (id: string): Contact | undefined => {
        return contacts.find(contact => contact.id === id);
    };

    // Handle sending message
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        
        const message: Message = {
            id: Date.now().toString(),
            senderId: 'current',
            recipientId: activeContact.id,
            content: newMessage,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };
        
        // Update conversations
        const updatedConversations = [...conversations];
        const conversationIndex = updatedConversations.findIndex(conv => conv.contactId === activeContact.id);
        
        if (conversationIndex !== -1) {
            // Add to existing conversation
            updatedConversations[conversationIndex] = {
                ...updatedConversations[conversationIndex],
                messages: [...updatedConversations[conversationIndex].messages, message],
                unreadCount: 0
            };
        } else {
            // Create new conversation
            updatedConversations.push({
                contactId: activeContact.id,
                messages: [message],
                unreadCount: 0
            });
        }
        
        setConversations(updatedConversations);
        setNewMessage('');
        
        // Simulate message delivery and read receipts
        setTimeout(() => {
            updateMessageStatus(message.id, 'delivered');
        }, 1000);
        
        setTimeout(() => {
            updateMessageStatus(message.id, 'read');
        }, 3000);
    };

    // Update message status
    const updateMessageStatus = (messageId: string, status: 'sent' | 'delivered' | 'read') => {
        setConversations(prev => prev.map(conv => ({
            ...conv,
            messages: conv.messages.map(msg => 
                msg.id === messageId ? { ...msg, status } : msg
            )
        })));
    };

    // Simulate receiving a message
    const simulateIncomingMessage = () => {
        const sender = contacts.find(c => c.id !== 'current' && c.status === 'online');
        if (!sender) return;
        
        const message: Message = {
            id: `sim-${Date.now()}`,
            senderId: sender.id,
            recipientId: 'current',
            content: 'This is a simulated message to demonstrate real-time chat functionality.',
            timestamp: new Date().toISOString(),
            status: 'delivered'
        };
        
        const updatedConversations = [...conversations];
        const conversationIndex = updatedConversations.findIndex(conv => conv.contactId === sender.id);
        
        if (conversationIndex !== -1) {
            updatedConversations[conversationIndex] = {
                ...updatedConversations[conversationIndex],
                messages: [...updatedConversations[conversationIndex].messages, message],
                unreadCount: updatedConversations[conversationIndex].unreadCount + 1
            };
        } else {
            updatedConversations.push({
                contactId: sender.id,
                messages: [message],
                unreadCount: 1
            });
        }
        
        setConversations(updatedConversations);
        setActiveContact(sender);
    };

    // Format timestamp for display
    const formatTime = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Format date for display
    const formatDate = (timestamp: string): string => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    // Group messages by date
    const groupMessagesByDate = (messages: Message[]): { date: string; messages: Message[] }[] => {
        const groups: { [key: string]: Message[] } = {};
        
        messages.forEach(message => {
            const dateKey = formatDate(message.timestamp);
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(message);
        });
        
        return Object.keys(groups).map(date => ({
            date,
            messages: groups[date]
        }));
    };

    // Filter contacts based on search
    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get message status icon
    const getMessageStatusIcon = (status: 'sent' | 'delivered' | 'read') => {
        switch (status) {
            case 'sent':
                return <Check className="w-4 h-4 text-gray-400" />;
            case 'delivered':
                return <CheckCheck className="w-4 h-4 text-gray-400" />;
            case 'read':
                return <CheckCheck className="w-4 h-4 text-[#A3386C]" />;
            default:
                return null;
        }
    };

    const activeConversation = getActiveConversation();

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-[#3D1528] to-[#A3386C] text-white z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="p-6 mt-4 border-b border-white/20">
                    <div className="flex flex-col items-center mb-2">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div className={`flex flex-col items-center transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                            <p className="text-lg font-semibold">Medical Staff</p>
                            <p className="text-xs text-white/70">Nurse</p>
                        </div>
                    </div>
                    <p className={`text-center text-xs text-white/70 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>UIC Medical Center</p>
                </div>

                <nav className="mt-8">
                    <div className="px-4 space-y-1">
                        <div className="flex items-center px-4 py-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => handleNavigation('/')}>
                            <LayoutDashboard className="w-5 h-5 text-white flex-shrink-0" />
                            {isSidebarOpen && <span className="ml-3 text-sm">Dashboard</span>}
                        </div>

                        <div className="flex items-center px-4 py-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => setSearchOpen(!isSearchOpen)}>
                            <Search className="w-5 h-5 text-white flex-shrink-0" />
                            {isSidebarOpen && (
                                <div className="flex justify-between w-full items-center">
                                    <span className="ml-3 text-sm">Patient Search</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isSearchOpen ? 'rotate-180' : ''}`} />
                                </div>
                            )}
                        </div>
                        {isSidebarOpen && isSearchOpen && (
                            <div className="mt-1 space-y-1 pl-12">
                                <div className="flex items-center p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => handleNavigation('/search/student')}>
                                    <GraduationCap className="w-4 h-4 text-white flex-shrink-0" />
                                    <span className="ml-2 text-sm">Students</span>
                                </div>
                                <div className="flex items-center p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => handleNavigation('/search/employee')}>
                                    <Briefcase className="w-4 h-4 text-white flex-shrink-0" />
                                    <span className="ml-2 text-sm">Employees</span>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center px-4 py-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => setInventoryOpen(!isInventoryOpen)}>
                            <Archive className="w-5 h-5 text-white flex-shrink-0" />
                            {isSidebarOpen && (
                                <div className="flex justify-between w-full items-center">
                                    <span className="ml-3 text-sm">Inventory</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isInventoryOpen ? 'rotate-180' : ''}`} />
                                </div>
                            )}
                        </div>
                        {isSidebarOpen && isInventoryOpen && (
                            <div className="mt-1 space-y-1 pl-12">
                                <div className="flex items-center p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => handleNavigation('/inventory/dashboard')}>
                                    <LayoutDashboard className="w-4 h-4 text-white flex-shrink-0" />
                                    <span className="ml-2 text-sm">Dashboard</span>
                                </div>
                                <div className="flex items-center p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => handleNavigation('/inventory/stocks')}>
                                    <Archive className="w-4 h-4 text-white flex-shrink-0" />
                                    <span className="ml-2 text-sm">Stocks</span>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center px-4 py-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => handleNavigation('/Reports')}>
                            <FileText className="w-5 h-5 text-white flex-shrink-0" />
                            {isSidebarOpen && <span className="ml-3 text-sm">Reports</span>}
                        </div>

                        <div className="flex items-center px-4 py-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => handleNavigation('/Print')}>
                            <Printer className="w-5 h-5 text-white flex-shrink-0" />
                            {isSidebarOpen && <span className="ml-3 text-sm">Print</span>}
                        </div>

                        <div className="flex items-center px-4 py-3 bg-white/20 rounded-lg cursor-pointer transition-colors" onClick={() => handleNavigation('/Chat')}>
                            <svg className="w-5 h-5 text-white flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                            </svg>
                            {isSidebarOpen && <span className="ml-3 text-sm font-medium">Chat</span>}
                        </div>

                        <div className="flex items-center px-4 py-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => handleNavigation('/About')}>
                            <ShieldQuestion className="w-5 h-5 text-white flex-shrink-0" />
                            {isSidebarOpen && <span className="ml-3 text-sm">About</span>}
                        </div>
                    </div>
                </nav>

                <div className="absolute bottom-6 left-0 right-0 px-4">
                    <div className={`flex items-center p-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors ${!isSidebarOpen && 'justify-center'}`} onClick={handleLogout}>
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 13v-2H7V8l-5 4 5 4v-3z"/>
                            <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"/>
                        </svg>
                        {isSidebarOpen && <span className="ml-3 text-sm">Logout</span>}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 flex transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Contacts Sidebar */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search contacts..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3386C] focus:border-transparent text-black"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {filteredContacts.map((contact) => {
                            const conversation = conversations.find(conv => conv.contactId === contact.id);
                            const lastMessage = conversation?.messages[conversation.messages.length - 1];
                            
                            return (
                                <div
                                    key={contact.id}
                                    className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                                        activeContact.id === contact.id ? 'bg-[#FDF2F8]' : ''
                                    }`}
                                    onClick={() => setActiveContact(contact)}
                                >
                                    <div className="relative">
                                        <img
                                            src={contact.avatar}
                                            alt={contact.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/images/default-avatar.png';
                                            }}
                                        />
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                            contact.status === 'online' ? 'bg-green-500' :
                                            contact.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                                        }`}></div>
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="text-sm font-semibold text-gray-900 truncate">{contact.name}</h3>
                                            {lastMessage && (
                                                <span className="text-xs text-gray-500">
                                                    {formatTime(lastMessage.timestamp)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{contact.role}</p>
                                        <div className="flex justify-between items-center">
                                            {lastMessage ? (
                                                <>
                                                    <p className="text-sm text-gray-600 truncate">
                                                        {lastMessage.content.substring(0, 25)}
                                                        {lastMessage.content.length > 25 ? '...' : ''}
                                                    </p>
                                                    {conversation?.unreadCount && conversation.unreadCount > 0 && (
                                                        <span className="bg-[#A3386C] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                                                            {conversation.unreadCount}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">No messages yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {/* Chat Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center">
                            <div className="relative">
                                <img
                                    src={activeContact.avatar}
                                    alt={activeContact.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/images/default-avatar.png';
                                    }}
                                />
                                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                    activeContact.status === 'online' ? 'bg-green-500' :
                                    activeContact.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                                }`}></div>
                            </div>
                            <div className="ml-3">
                                <h2 className="text-lg font-semibold text-gray-900">{activeContact.name}</h2>
                                <p className="text-sm text-gray-500">
                                    {activeContact.role} • {activeContact.status === 'online' ? 'Online' : activeContact.lastSeen}
                                </p>
                            </div>
                        </div>
                        
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        {activeConversation ? (
                            <div className="space-y-4">
                                {groupMessagesByDate(activeConversation.messages).map((group, groupIndex) => (
                                    <div key={groupIndex}>
                                        <div className="flex justify-center my-4">
                                            <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                                {group.date}
                                            </span>
                                        </div>
                                        {group.messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.senderId === 'current' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                        message.senderId === 'current'
                                                            ? 'bg-[#A3386C] text-white rounded-br-none'
                                                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                                    }`}
                                                >
                                                    <p className="text-sm">{message.content}</p>
                                                    <div className={`flex items-center justify-end mt-1 ${
                                                        message.senderId === 'current' ? 'text-white/70' : 'text-gray-500'
                                                    }`}>
                                                        <span className="text-xs">{formatTime(message.timestamp)}</span>
                                                        {message.senderId === 'current' && getMessageStatusIcon(message.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                                {isTyping && typingContact === activeContact.id && (
                                    <div className="flex justify-start">
                                        <div className="bg-white text-gray-800 border border-gray-200 rounded-lg rounded-bl-none px-4 py-2">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-lg font-medium">No messages yet</p>
                                <p className="text-sm">Start a conversation with {activeContact.name}</p>
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200 bg-white">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        // Handle the file attachment here
                                        console.log('File selected:', file.name);
                                        // You can implement file upload logic here
                                    }
                                }}
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx"
                            />
                            <button
                                type="button"
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Paperclip className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#A3386C] focus:border-transparent text-black"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-3 bg-[#A3386C] text-white rounded-full hover:bg-[#8a2f58] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;