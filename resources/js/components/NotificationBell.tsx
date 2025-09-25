import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, X, Check, User } from 'lucide-react';
import Swal from 'sweetalert2';
import { BranchInventoryService } from '../services/branchInventoryService';
import ReactDOM from 'react-dom';
import { UserService } from '../services/userService';
import { NotificationService } from '../services/notificationService';

export interface Notification {
    id: number | string;
    type: 'info' | 'warning' | 'success' | 'error' | 'request';
    message: string;
    title?: string;
    description?: string;
    isRead: boolean;
    createdAt: string;
    // optional associated branch_request id
    requestId?: number;
}

export interface LowStockMedicine {
    medicine_id: number;
    medicine_name: string;
    quantity: number;
    medicine_category?: string;
}

interface NotificationBellProps {
    notifications?: Notification[];
    lowStockMedicines?: LowStockMedicine[];
    onSeeAll?: () => void;
    onMarkAsRead?: () => void;
    // optional callbacks for handling branch request actions
    onApproveRequest?: (requestId: number) => Promise<void> | void;
    onRejectRequest?: (requestId: number) => Promise<void> | void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, lowStockMedicines = [], onSeeAll, onMarkAsRead, onApproveRequest, onRejectRequest }) => {
    const [isNotificationOpen, setNotificationOpen] = useState(false);
    const [showLowStockAlert, setShowLowStockAlert] = useState(false);
    const [alertShownBefore, setAlertShownBefore] = useState(false);
    const [lowStockNotificationsCreated, setLowStockNotificationsCreated] = useState(false);
    const [fetchedNotifications, setFetchedNotifications] = useState<Notification[]>([]);
    const [fetchedLowStock, setFetchedLowStock] = useState<LowStockMedicine[]>([]);
    const [branchesMap, setBranchesMap] = useState<Record<number, string>>({});
    // local optimistic status map for requests: { [requestId]: 'approved' | 'rejected' }
    const [requestActionStatus, setRequestActionStatus] = useState<Record<number, 'approved' | 'rejected'>>({});

    // Generate low stock notifications from lowStockMedicines
    const generateLowStockNotifications = (): Notification[] => {
        if (lowStockMedicines.length === 0 || lowStockNotificationsCreated) return [];

        const currentTime = new Date().toISOString();
            return lowStockMedicines.map((medicine) => {
                // prefer numeric quantity fields; if missing, coerce to 0
                const qtyNum = Number((medicine as any).quantity ?? (medicine as any).current_stock ?? 0) || 0;
                const title = 'Low Stock Alert';
                const line2 = `${medicine.medicine_name}: ${qtyNum} units remaining`;
                const dateStr = new Date().toLocaleDateString();
                const message = `${title}\n${line2}\n${dateStr}`;
                return {
                    id: `low-stock-${medicine.medicine_id}`,
                    type: 'warning' as const,
                    // Use a newline-separated message matching backend format so NotificationBell renders it consistently
                    message,
                    isRead: false,
                    createdAt: currentTime
                } as Notification;
            });
    };

    // Decide source: use props if provided, otherwise use fetched data
    const effectiveNotifications = (notifications && notifications.length > 0) ? notifications : fetchedNotifications;
    const effectiveLowStock = (lowStockMedicines && lowStockMedicines.length > 0) ? lowStockMedicines : fetchedLowStock;

    // Combine original/fetched notifications with generated low stock notifications
    const allNotifications = [...effectiveNotifications, ...generateLowStockNotifications()];

    // Helper: replace 'Branch <n>' placeholders (or fallback) with real branch names using branchesMap
    const resolveBranchNamesInMessage = (msg: string) => {
        if (!msg || Object.keys(branchesMap).length === 0) return msg;
        // match 'Branch <digits>' (case-insensitive)
        return msg.replace(/Branch\s*(\d+)/gi, (m, p1) => {
            const id = Number(p1);
            return branchesMap[id] ?? `Branch ${id}`;
        });
    };

    // Auto-show low stock alert when there are medicines with 50 or below units
    // Show the alert only once per medicine by persisting shown IDs in localStorage
    useEffect(() => {
        if (!lowStockMedicines || lowStockMedicines.length === 0) return;

        try {
            const storageKey = 'hims_low_stock_shown_v1';
            const raw = localStorage.getItem(storageKey);
            const shownMap = raw ? JSON.parse(raw) : {};

            // Filter medicines that haven't been shown yet
            const unseen = lowStockMedicines.filter(m => !shownMap[String(m.medicine_id)]);
            if (unseen.length === 0) return; // nothing new to show

            // Mark them as shown now
            unseen.forEach(m => { shownMap[String(m.medicine_id)] = true; });
            localStorage.setItem(storageKey, JSON.stringify(shownMap));
            setLowStockNotificationsCreated(true);

            // Build toast HTML with fallback text for undefined quantities
            const listItems = lowStockMedicines.slice(0, 5).map(m => {
                    const qtyNum = Number((m as any).quantity ?? (m as any).current_stock ?? 0) || 0;
                    const qtyText = `${qtyNum} units`;
                return `<li style=\"margin-bottom:4px\">${m.medicine_name}: ${qtyText}</li>`;
            }).join('');

            const toastHtml = `
                <div style="text-align:left;box-sizing:border-box;width:100%;">
                    <div style="font-weight:700;margin-bottom:6px;color:#7f1d1d">Low Stock Alert</div>
                    <div style="font-size:13px;color:#7f1d1d;margin-bottom:6px">${lowStockMedicines.length} medicine${lowStockMedicines.length > 1 ? 's' : ''} need reordering (≤50 units)</div>
                    <div style="font-size:12px;color:#7f1d1d;max-height:96px;overflow:auto;word-break:break-word;white-space:normal;">
                        <ul style="padding-left:12px;margin:0">${listItems}</ul>
                        ${lowStockMedicines.length > 5 ? `<div style=\"margin-top:6px\">... and ${lowStockMedicines.length - 5} more</div>` : ''}
                    </div>
                </div>
            `;

            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true,
                width: '320px',
                customClass: {
                    popup: 'rounded-lg shadow-lg'
                }
            });

            Toast.fire({
                html: toastHtml,
                icon: 'warning'
            });
        } catch (err) {
            // fail gracefully
            console.error('Low stock toast error', err);
        }
    }, [lowStockMedicines]);

    // Persist low-stock notifications to backend and create immediate UI notifications.
    useEffect(() => {
        const persistLowStock = async () => {
            try {
                const currentUser = UserService.getCurrentUser();
                if (!currentUser || !currentUser.branch_id) return;
                const branchId = currentUser.branch_id;

                // use localStorage to avoid creating duplicate backend notifications in the same browser/session
                const storageKey = 'hims_low_stock_persisted_v1';
                const raw = localStorage.getItem(storageKey);
                const persisted: Record<string, boolean> = raw ? JSON.parse(raw) : {};

                const toPersist = (effectiveLowStock || []).filter((m: any) => {
                    const key = `${branchId}:${m.medicine_id}`;
                    return !persisted[key];
                });

                if (toPersist.length === 0) return;

                for (const m of toPersist) {
                    const qty = Number((m as any).quantity ?? (m as any).current_stock ?? 0) || 0;
                    const message = `Low Stock Alert\n${m.medicine_name}: ${qty} units remaining\n${new Date().toLocaleDateString()}`;
                    try {
                        // pass medicine_id as reference_id to support backend dedupe by (branch, reference_id)
                        await BranchInventoryService.createNotification(branchId, Number(m.medicine_id || 0), 'low_stock', message);
                    } catch (err) {
                        console.warn('Failed to persist low-stock notification', err);
                    }

                    // create an immediate UI notification (local) so user sees it right away
                    try {
                        NotificationService.createNotification(`Low Stock Alert: ${m.medicine_name} has only ${qty} units remaining`, 'warning');
                    } catch (err) {
                        console.warn('Failed to create local notification', err);
                    }

                    // mark persisted
                    const key = `${branchId}:${m.medicine_id}`;
                    persisted[key] = true;
                }

                localStorage.setItem(storageKey, JSON.stringify(persisted));
                setLowStockNotificationsCreated(true);
            } catch (err) {
                console.error('Error persisting low stock notifications', err);
            }
        };

        // run when effectiveLowStock changes
        persistLowStock();
    }, [effectiveLowStock]);

    // Fetch notifications and low stock if parent didn't provide them
    useEffect(() => {
        let mounted = true;
        const currentUser = UserService.getCurrentUser();
        if (!currentUser || !currentUser.branch_id) return;

        const branchId = currentUser.branch_id;

        const fetchData = async () => {
            try {
                // only fetch notifications if parent didn't provide
                if (!notifications || notifications.length === 0) {
                    const rows = await BranchInventoryService.getNotifications(branchId);
                    if (!mounted) return;
                    // normalize to Notification shape minimally
                    const normalized = (rows || []).map((r: any) => ({
                        id: r.notification_id ?? r.id ?? Math.random().toString(36).slice(2),
                        type: (r.type === 'low_stock' ? 'warning' : (r.type === 'request' ? 'request' : 'info')) as any,
                        message: r.message ?? '',
                        isRead: !!r.is_read,
                        createdAt: r.created_at ?? new Date().toISOString(),
                        requestId: r.request_id ?? undefined,
                        // include server-provided request status when available (from NotificationController)
                        requestStatus: r.request_status ?? r.requestStatus ?? undefined,
                    })) as Notification[];
                    setFetchedNotifications(normalized);
                }

                // only fetch low-stock if parent didn't provide
                if (!lowStockMedicines || lowStockMedicines.length === 0) {
                    const low = await BranchInventoryService.getLowStockMedicinesMSSQL(branchId).catch(() => []);
                    if (!mounted) return;
                    setFetchedLowStock(Array.isArray(low) ? low.map((l: any) => ({ medicine_id: l.medicine_id, medicine_name: l.medicine_name, quantity: l.quantity })) : []);
                }

                // fetch branches once to resolve branch names in messages
                const branches = await BranchInventoryService.getAllBranches().catch(() => []);
                if (!mounted) return;
                const map: Record<number, string> = {};
                (branches || []).forEach((b: any) => { if (b && b.branch_id) map[Number(b.branch_id)] = b.branch_name || `Branch ${b.branch_id}`; });
                setBranchesMap(map);
            } catch (err) {
                console.error('NotificationBell fetch error', err);
            }
        };

        fetchData();

        return () => { mounted = false; };
    }, []);

    const toggleNotification = () => {
        setNotificationOpen(!isNotificationOpen);
        
        // Mark notifications as read when bell is clicked
        if (!isNotificationOpen && allNotifications.length > 0) {
            // call parent callback if provided
            if (onMarkAsRead) onMarkAsRead();
            // otherwise call backend directly
            else {
                const currentUser = UserService.getCurrentUser();
                if (currentUser && currentUser.branch_id) {
                    BranchInventoryService.markNotificationsRead(currentUser.branch_id).catch(err => console.error(err));
                }
            }
        }
    };

    const closeLowStockAlert = () => {
        setShowLowStockAlert(false);
    };

    // Show only first 2 notifications in the bell, rest go to notification page
    const displayedNotifications = allNotifications.slice(0, 2);
    const hasMoreNotifications = allNotifications.length > 2;

    // Approve/reject handlers when NotificationBell owns the calls
    const handleApprove = async (requestId: number) => {
        // if parent provided a handler, call it (assume parent handles messages)
        if (onApproveRequest) return onApproveRequest(requestId);

        const currentUser = UserService.getCurrentUser();
        if (!currentUser) return;

        // indicate loading state optimistically
        setRequestActionStatus(prev => ({ ...prev, [requestId]: 'approved' }));

        try {
            const res = await BranchInventoryService.approveBranchRequest(requestId, currentUser.user_id);
            if (res && res.success) {
                // show server message or generic
                Swal.fire({ icon: 'success', title: res.message || 'Approved', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
                const rows = await BranchInventoryService.getNotifications(currentUser.branch_id);
                const normalized = (rows || []).map((r: any) => ({ id: r.notification_id ?? r.id, type: (r.type === 'low_stock' ? 'warning' : (r.type === 'request' ? 'request' : 'info')) as any, message: r.message ?? '', isRead: !!r.is_read, createdAt: r.created_at })) as Notification[];
                setFetchedNotifications(normalized);
            } else {
                // show server error and revert UI status
                setRequestActionStatus(prev => { const copy = { ...prev }; delete copy[requestId]; return copy; });
                Swal.fire({ icon: 'error', title: res?.message || 'Failed to approve', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
            }
        } catch (err: any) {
            setRequestActionStatus(prev => { const copy = { ...prev }; delete copy[requestId]; return copy; });
            Swal.fire({ icon: 'error', title: 'Error approving request', text: err?.message || '', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
        }
    };

    const handleReject = async (requestId: number) => {
        if (onRejectRequest) return onRejectRequest(requestId);

        const currentUser = UserService.getCurrentUser();
        if (!currentUser) return;

        setRequestActionStatus(prev => ({ ...prev, [requestId]: 'rejected' }));

        try {
            const res = await BranchInventoryService.rejectBranchRequest(requestId, currentUser.user_id);
            if (res && res.success) {
                Swal.fire({ icon: 'success', title: res.message || 'Rejected', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
                const rows = await BranchInventoryService.getNotifications(currentUser.branch_id);
                const normalized = (rows || []).map((r: any) => ({ id: r.notification_id ?? r.id, type: (r.type === 'low_stock' ? 'warning' : (r.type === 'request' ? 'request' : 'info')) as any, message: r.message ?? '', isRead: !!r.is_read, createdAt: r.created_at })) as Notification[];
                setFetchedNotifications(normalized);
            } else {
                setRequestActionStatus(prev => { const copy = { ...prev }; delete copy[requestId]; return copy; });
                Swal.fire({ icon: 'error', title: res?.message || 'Failed to reject', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
            }
        } catch (err: any) {
            setRequestActionStatus(prev => { const copy = { ...prev }; delete copy[requestId]; return copy; });
            Swal.fire({ icon: 'error', title: 'Error rejecting request', text: err?.message || '', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
        }
    };

    return (
        <div className="relative">
            {/* Low Stock Alert Popup */}
            {showLowStockAlert && (
                <div className="fixed top-4 right-4 z-50 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right duration-300">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-red-800 mb-1">
                                Low Stock Alert!
                            </h3>
                            <p className="text-sm text-red-700 mb-2">
                                {lowStockMedicines.length} medicine{lowStockMedicines.length > 1 ? 's' : ''} need{lowStockMedicines.length === 1 ? 's' : ''} reordering (≤50 units)
                            </p>
                            <div className="max-h-20 overflow-y-auto">
                                {lowStockMedicines.slice(0, 3).map(medicine => (
                                    <div key={medicine.medicine_id} className="text-xs text-red-600 mb-1">
                                            • {medicine.medicine_name}: {Number(medicine.quantity ?? 0)} units
                                    </div>
                                ))}
                                {lowStockMedicines.length > 3 && (
                                    <div className="text-xs text-red-600">
                                        ... and {lowStockMedicines.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={closeLowStockAlert}
                            className="flex-shrink-0 ml-2 text-red-400 hover:text-red-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Bell icon with notification count */}
            <div className="relative">
                <Bell className="w-6 h-6 text-white cursor-pointer" onClick={toggleNotification} />
                {allNotifications.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {allNotifications.length > 9 ? '9+' : allNotifications.length}
                    </span>
                )}
            </div>
            {typeof document !== 'undefined' && ReactDOM.createPortal(
                <>
            {/* Backdrop that darkens/blocks interaction with header when notifications open */}
            {isNotificationOpen && (
                <div
                    onClick={() => setNotificationOpen(false)}
                    style={{ zIndex: 99990 }}
                    className="fixed inset-0 bg-transparent pointer-events-auto"
                />
            )}

            <div
                // make the dropdown overlay the header/table by using fixed positioning
                className={`
                    fixed top-12 right-3 max-w-lg w-[400px] bg-white rounded-lg shadow-2xl
                    transition-all duration-200 ease-in-out transform
                    ${isNotificationOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 -translate-y-2 pointer-events-none'}
                `}
                style={{ zIndex: 99999 }}
            >
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Recent Notification History</h3>
                    </div>
                    {allNotifications.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center">No new notifications.</p>
                    ) : (
                        <div className="space-y-3">
                            {displayedNotifications.map(notification => (
                                <div key={notification.id} className="flex items-start p-2 rounded-lg hover:bg-gray-50">
                                    {/* Avatar/icon column */}
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 bg-gray-100">
                                        <User className="w-5 h-5 text-gray-700" />
                                    </div>
                                    <div className="flex-1">
                                        {/* If this is a low stock notification, prefer newline-separated message parts */}
                                                {notification.type === 'warning' && notification.message && notification.message.includes('\n') ? (
                                            (() => {
                                                const parts = resolveBranchNamesInMessage(notification.message).split('\n').map(p => p.trim()).filter(Boolean);
                                                const titlePart = parts[0] ?? 'Low Stock Alert';
                                                // remove any trailing request token like [req:123] from contentPart
                                                let contentPart = parts[1] ?? '';
                                                contentPart = contentPart.replace(/\s*\[req:\s*\d+\s*\]\s*$/i, '');
                                                const datePart = parts[2] ?? new Date(notification.createdAt).toLocaleDateString();
                                                return (
                                                    <>
                                                        <p className="text-sm font-semibold text-gray-800">{titlePart}</p>
                                                        <p className="text-xs text-gray-700 mt-1">{contentPart}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{datePart}</p>
                                                    </>
                                                );
                                            })()
                                                ) : (
                                            <>
                                                {/* Strip request token when showing raw message */}
                                                <p className="text-sm font-medium text-gray-800">{(notification.title ?? resolveBranchNamesInMessage(notification.message)).toString().replace(/\s*\[req:\s*\d+\s*\]\s*$/i, '')}</p>
                                                {/* If this is a request notification, show action buttons above the date */}
                                                {/* request action buttons are rendered below to avoid duplication */}
                                                <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleDateString()}</p>
                                            </>
                                        )}
                                        {/* If this notification represents a branch request, show Approve/Reject */}
                                        {notification.type === 'request' && (notification as any).requestId && (
                                            (() => {
                                                const id = Number((notification as any).requestId);
                                                // prefer a local optimistic status, otherwise use server-provided status
                                                const serverStatus = (notification as any).requestStatus || (notification as any).request_status || null;
                                                const localStatus = requestActionStatus[id] ?? null;
                                                const effectiveStatus = localStatus || serverStatus;

                                                if (effectiveStatus === 'approved') {
                                                    return (
                                                        <div className="mt-3">
                                                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm">Approved</span>
                                                        </div>
                                                    );
                                                }
                                                if (effectiveStatus === 'rejected') {
                                                    return (
                                                        <div className="mt-3">
                                                            <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm">Rejected</span>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div className="mt-3 flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                if (onApproveRequest) onApproveRequest(id);
                                                                else handleApprove(id);
                                                            }}
                                                            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm flex items-center"
                                                        >
                                                            <Check className="w-4 h-4 mr-2" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (onRejectRequest) onRejectRequest(id);
                                                                else handleReject(id);
                                                            }}
                                                            className="px-3 py-1 bg-red-600 text-white rounded-md text-sm flex items-center"
                                                        >
                                                            <X className="w-4 h-4 mr-2" />
                                                            Reject
                                                        </button>
                                                    </div>
                                                );
                                            })()
                                        )}
                                    </div>
                                </div>
                            ))}
                            {hasMoreNotifications && (
                                <div className="border-t pt-3 mt-3">
                                    <p className="text-xs text-gray-500 text-center">
                                        {allNotifications.length - 2} more notifications...
                                    </p>
                                    {onSeeAll && (
                                        <button 
                                            className="w-full text-sm text-[#A3386C] hover:underline mt-1" 
                                            onClick={() => onSeeAll()}
                                        >
                                            View All Notifications
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
                </>,
                document.body
            )}
        </div>
    );
};

export default NotificationBell;
