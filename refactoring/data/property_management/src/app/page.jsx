import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const PROPERTY_TYPES = ['apartment', 'house', 'condo', 'townhouse', 'commercial'];
const UNIT_STATUSES = ['vacant', 'occupied', 'maintenance', 'reserved'];
const LEASE_STATUSES = ['active', 'expired', 'pending', 'terminated'];
const PAYMENT_STATUSES = ['paid', 'pending', 'overdue', 'partial'];
const MAINTENANCE_PRIORITIES = ['low', 'medium', 'high', 'emergency'];
const MAINTENANCE_STATUSES = ['open', 'in_progress', 'completed', 'cancelled'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PRIORITY_COLORS = { low: '#22c55e', medium: '#eab308', high: '#f97316', emergency: '#dc2626' };
const STATUS_COLORS = { vacant: '#3b82f6', occupied: '#22c55e', maintenance: '#f97316', reserved: '#8b5cf6' };
const PAYMENT_COLORS = { paid: '#22c55e', pending: '#eab308', overdue: '#dc2626', partial: '#f97316' };

const INITIAL_PROPERTIES = [
  { id: 'p1', name: 'Sunrise Apartments', address: '123 Main St, Springfield, IL 62701', type: 'apartment', units: 12, yearBuilt: 2015, sqft: 18000, amenities: ['pool', 'gym', 'parking', 'laundry'], manager: 'Alice Chen', managerPhone: '555-0101', managerEmail: 'alice@propmanage.com', notes: 'Recently renovated lobby and common areas', image: null },
  { id: 'p2', name: 'Oak Ridge Condos', address: '456 Oak Ave, Springfield, IL 62702', type: 'condo', units: 8, yearBuilt: 2019, sqft: 12000, amenities: ['parking', 'security', 'rooftop'], manager: 'Bob Martinez', managerPhone: '555-0102', managerEmail: 'bob@propmanage.com', notes: 'HOA meeting every first Monday', image: null },
  { id: 'p3', name: 'Maple Street Houses', address: '789 Maple St, Springfield, IL 62703', type: 'house', units: 4, yearBuilt: 2008, sqft: 8000, amenities: ['yard', 'garage', 'basement'], manager: 'Alice Chen', managerPhone: '555-0101', managerEmail: 'alice@propmanage.com', notes: 'Yearly exterior maintenance scheduled for September', image: null },
  { id: 'p4', name: 'Downtown Commercial Plaza', address: '100 Commerce Dr, Springfield, IL 62704', type: 'commercial', units: 6, yearBuilt: 2020, sqft: 24000, amenities: ['parking', 'elevator', 'security', 'loading_dock'], manager: 'Carol Williams', managerPhone: '555-0103', managerEmail: 'carol@propmanage.com', notes: 'Mixed retail and office spaces', image: null },
];

const INITIAL_UNITS = [
  { id: 'u1', propertyId: 'p1', number: '101', floor: 1, bedrooms: 1, bathrooms: 1, sqft: 650, rent: 1200, status: 'occupied', features: ['balcony', 'dishwasher'] },
  { id: 'u2', propertyId: 'p1', number: '102', floor: 1, bedrooms: 2, bathrooms: 1, sqft: 900, rent: 1600, status: 'occupied', features: ['balcony', 'dishwasher', 'washer_dryer'] },
  { id: 'u3', propertyId: 'p1', number: '201', floor: 2, bedrooms: 1, bathrooms: 1, sqft: 650, rent: 1250, status: 'vacant', features: ['balcony'] },
  { id: 'u4', propertyId: 'p1', number: '202', floor: 2, bedrooms: 3, bathrooms: 2, sqft: 1200, rent: 2200, status: 'maintenance', features: ['balcony', 'dishwasher', 'washer_dryer', 'walk_in_closet'] },
  { id: 'u5', propertyId: 'p2', number: 'A1', floor: 1, bedrooms: 2, bathrooms: 2, sqft: 1100, rent: 2000, status: 'occupied', features: ['parking_spot', 'storage_unit'] },
  { id: 'u6', propertyId: 'p2', number: 'A2', floor: 1, bedrooms: 2, bathrooms: 2, sqft: 1100, rent: 2000, status: 'occupied', features: ['parking_spot', 'storage_unit'] },
  { id: 'u7', propertyId: 'p2', number: 'B1', floor: 2, bedrooms: 3, bathrooms: 2, sqft: 1400, rent: 2800, status: 'reserved', features: ['parking_spot', 'storage_unit', 'den'] },
  { id: 'u8', propertyId: 'p3', number: '1', floor: 1, bedrooms: 3, bathrooms: 2, sqft: 1800, rent: 2400, status: 'occupied', features: ['yard', 'garage', 'basement'] },
  { id: 'u9', propertyId: 'p3', number: '2', floor: 1, bedrooms: 4, bathrooms: 3, sqft: 2200, rent: 3000, status: 'occupied', features: ['yard', 'garage', 'basement', 'fireplace'] },
  { id: 'u10', propertyId: 'p4', number: 'G1', floor: 1, bedrooms: 0, bathrooms: 1, sqft: 2000, rent: 4500, status: 'occupied', features: ['storefront', 'loading_dock'] },
  { id: 'u11', propertyId: 'p4', number: 'G2', floor: 1, bedrooms: 0, bathrooms: 1, sqft: 1500, rent: 3500, status: 'vacant', features: ['storefront'] },
  { id: 'u12', propertyId: 'p4', number: '201', floor: 2, bedrooms: 0, bathrooms: 2, sqft: 3000, rent: 5000, status: 'occupied', features: ['elevator_access', 'conference_room'] },
];

const INITIAL_TENANTS = [
  { id: 't1', firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', phone: '555-1001', emergencyContact: 'Jane Smith (555-1002)', moveInDate: '2023-06-01', creditScore: 720, pets: [{ type: 'dog', name: 'Buddy', breed: 'Labrador' }], vehicles: [{ make: 'Toyota', model: 'Camry', year: 2020, plate: 'IL-ABC123' }], notes: 'Quiet tenant, always pays on time' },
  { id: 't2', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@email.com', phone: '555-1003', emergencyContact: 'Mike Johnson (555-1004)', moveInDate: '2023-01-15', creditScore: 680, pets: [], vehicles: [{ make: 'Honda', model: 'Civic', year: 2019, plate: 'IL-DEF456' }], notes: '' },
  { id: 't3', firstName: 'Michael', lastName: 'Davis', email: 'mdavis@email.com', phone: '555-1005', emergencyContact: 'Linda Davis (555-1006)', moveInDate: '2022-09-01', creditScore: 750, pets: [{ type: 'cat', name: 'Whiskers', breed: 'Siamese' }], vehicles: [], notes: 'Works from home, prefers email communication' },
  { id: 't4', firstName: 'Emily', lastName: 'Brown', email: 'emily.b@email.com', phone: '555-1007', emergencyContact: 'Tom Brown (555-1008)', moveInDate: '2024-01-01', creditScore: 700, pets: [], vehicles: [{ make: 'Ford', model: 'Escape', year: 2022, plate: 'IL-GHI789' }], notes: 'New tenant, referred by Sarah Johnson' },
  { id: 't5', firstName: 'Robert', lastName: 'Wilson', email: 'rwilson@email.com', phone: '555-1009', emergencyContact: 'Mary Wilson (555-1010)', moveInDate: '2023-03-01', creditScore: 690, pets: [], vehicles: [{ make: 'Chevrolet', model: 'Malibu', year: 2021, plate: 'IL-JKL012' }], notes: '' },
  { id: 't6', firstName: 'Lisa', lastName: 'Garcia', email: 'lgarcia@email.com', phone: '555-1011', emergencyContact: 'Carlos Garcia (555-1012)', moveInDate: '2022-06-15', creditScore: 740, pets: [{ type: 'dog', name: 'Max', breed: 'Poodle' }], vehicles: [{ make: 'BMW', model: 'X3', year: 2023, plate: 'IL-MNO345' }], notes: 'Business owner, rents commercial space' },
  { id: 't7', firstName: 'TechCorp', lastName: 'LLC', email: 'admin@techcorp.com', phone: '555-1013', emergencyContact: 'James Tech (555-1014)', moveInDate: '2023-08-01', creditScore: null, pets: [], vehicles: [], notes: 'Commercial tenant — 3 year lease' },
];

const INITIAL_LEASES = [
  { id: 'l1', unitId: 'u1', tenantId: 't1', startDate: '2023-06-01', endDate: '2025-05-31', monthlyRent: 1200, securityDeposit: 2400, status: 'active', terms: 'Standard 2-year residential lease', autoRenew: true, rentIncreasePercent: 3 },
  { id: 'l2', unitId: 'u2', tenantId: 't2', startDate: '2023-01-15', endDate: '2025-01-14', monthlyRent: 1600, securityDeposit: 3200, status: 'active', terms: 'Standard 2-year residential lease', autoRenew: true, rentIncreasePercent: 3 },
  { id: 'l3', unitId: 'u5', tenantId: 't3', startDate: '2022-09-01', endDate: '2024-08-31', monthlyRent: 2000, securityDeposit: 4000, status: 'expired', terms: '2-year condo lease with HOA compliance', autoRenew: false, rentIncreasePercent: 0 },
  { id: 'l4', unitId: 'u6', tenantId: 't4', startDate: '2024-01-01', endDate: '2025-12-31', monthlyRent: 2000, securityDeposit: 4000, status: 'active', terms: '2-year condo lease', autoRenew: true, rentIncreasePercent: 2.5 },
  { id: 'l5', unitId: 'u8', tenantId: 't5', startDate: '2023-03-01', endDate: '2025-02-28', monthlyRent: 2400, securityDeposit: 4800, status: 'active', terms: '2-year house lease with yard maintenance included', autoRenew: false, rentIncreasePercent: 0 },
  { id: 'l6', unitId: 'u9', tenantId: 't3', startDate: '2024-09-01', endDate: '2025-08-31', monthlyRent: 3000, securityDeposit: 6000, status: 'active', terms: '1-year residential lease', autoRenew: true, rentIncreasePercent: 4 },
  { id: 'l7', unitId: 'u10', tenantId: 't6', startDate: '2022-06-15', endDate: '2025-06-14', monthlyRent: 4500, securityDeposit: 9000, status: 'active', terms: '3-year commercial lease with annual rent review', autoRenew: false, rentIncreasePercent: 0 },
  { id: 'l8', unitId: 'u12', tenantId: 't7', startDate: '2023-08-01', endDate: '2026-07-31', monthlyRent: 5000, securityDeposit: 15000, status: 'active', terms: '3-year commercial lease, tenant responsible for fit-out', autoRenew: true, rentIncreasePercent: 3 },
];

const now = Date.now();
const DAY = 86400000;

const INITIAL_PAYMENTS = [
  { id: 'pay1', leaseId: 'l1', tenantId: 't1', amount: 1200, date: '2025-01-01', dueDate: '2025-01-01', status: 'paid', method: 'bank_transfer', reference: 'BT-20250101-001', notes: '' },
  { id: 'pay2', leaseId: 'l1', tenantId: 't1', amount: 1200, date: '2025-02-01', dueDate: '2025-02-01', status: 'paid', method: 'bank_transfer', reference: 'BT-20250201-001', notes: '' },
  { id: 'pay3', leaseId: 'l1', tenantId: 't1', amount: 1200, date: '2025-03-03', dueDate: '2025-03-01', status: 'paid', method: 'bank_transfer', reference: 'BT-20250303-001', notes: 'Late by 2 days' },
  { id: 'pay4', leaseId: 'l1', tenantId: 't1', amount: 1200, date: null, dueDate: '2025-04-01', status: 'overdue', method: null, reference: null, notes: '' },
  { id: 'pay5', leaseId: 'l2', tenantId: 't2', amount: 1600, date: '2025-01-15', dueDate: '2025-01-15', status: 'paid', method: 'check', reference: 'CHK-4521', notes: '' },
  { id: 'pay6', leaseId: 'l2', tenantId: 't2', amount: 1600, date: '2025-02-15', dueDate: '2025-02-15', status: 'paid', method: 'check', reference: 'CHK-4590', notes: '' },
  { id: 'pay7', leaseId: 'l2', tenantId: 't2', amount: 800, date: '2025-03-15', dueDate: '2025-03-15', status: 'partial', method: 'check', reference: 'CHK-4612', notes: 'Partial payment — balance due by end of month' },
  { id: 'pay8', leaseId: 'l4', tenantId: 't4', amount: 2000, date: '2025-01-01', dueDate: '2025-01-01', status: 'paid', method: 'bank_transfer', reference: 'BT-20250101-004', notes: '' },
  { id: 'pay9', leaseId: 'l4', tenantId: 't4', amount: 2000, date: '2025-02-01', dueDate: '2025-02-01', status: 'paid', method: 'bank_transfer', reference: 'BT-20250201-004', notes: '' },
  { id: 'pay10', leaseId: 'l4', tenantId: 't4', amount: 2000, date: null, dueDate: '2025-03-01', status: 'pending', method: null, reference: null, notes: '' },
  { id: 'pay11', leaseId: 'l5', tenantId: 't5', amount: 2400, date: '2025-01-01', dueDate: '2025-01-01', status: 'paid', method: 'bank_transfer', reference: 'BT-20250101-005', notes: '' },
  { id: 'pay12', leaseId: 'l5', tenantId: 't5', amount: 2400, date: '2025-02-01', dueDate: '2025-02-01', status: 'paid', method: 'bank_transfer', reference: 'BT-20250201-005', notes: '' },
  { id: 'pay13', leaseId: 'l7', tenantId: 't6', amount: 4500, date: '2025-01-15', dueDate: '2025-01-15', status: 'paid', method: 'wire', reference: 'WR-20250115-006', notes: '' },
  { id: 'pay14', leaseId: 'l7', tenantId: 't6', amount: 4500, date: '2025-02-15', dueDate: '2025-02-15', status: 'paid', method: 'wire', reference: 'WR-20250215-006', notes: '' },
  { id: 'pay15', leaseId: 'l8', tenantId: 't7', amount: 5000, date: '2025-01-01', dueDate: '2025-01-01', status: 'paid', method: 'wire', reference: 'WR-20250101-007', notes: '' },
  { id: 'pay16', leaseId: 'l8', tenantId: 't7', amount: 5000, date: '2025-02-01', dueDate: '2025-02-01', status: 'paid', method: 'wire', reference: 'WR-20250201-007', notes: '' },
  { id: 'pay17', leaseId: 'l6', tenantId: 't3', amount: 3000, date: '2025-01-01', dueDate: '2025-01-01', status: 'paid', method: 'bank_transfer', reference: 'BT-20250101-003', notes: '' },
  { id: 'pay18', leaseId: 'l6', tenantId: 't3', amount: 3000, date: '2025-02-01', dueDate: '2025-02-01', status: 'paid', method: 'bank_transfer', reference: 'BT-20250201-003', notes: '' },
];

const INITIAL_MAINTENANCE = [
  { id: 'm1', unitId: 'u1', tenantId: 't1', propertyId: 'p1', title: 'Leaky kitchen faucet', description: 'Kitchen faucet drips constantly. Washer may need replacement.', priority: 'medium', status: 'in_progress', createdAt: '2025-02-10', updatedAt: '2025-02-12', assignedTo: 'Mike Plumber', estimatedCost: 150, actualCost: null, category: 'plumbing', photos: [], notes: [{ id: 'n1', author: 'Alice Chen', text: 'Scheduled Mike for Tuesday', date: '2025-02-11' }] },
  { id: 'm2', unitId: 'u4', tenantId: null, propertyId: 'p1', title: 'Full bathroom renovation', description: 'Complete renovation of master bathroom including new fixtures, tiles, and vanity.', priority: 'low', status: 'in_progress', createdAt: '2025-01-15', updatedAt: '2025-02-20', assignedTo: 'ABC Contractors', estimatedCost: 8000, actualCost: null, category: 'renovation', photos: [], notes: [{ id: 'n2', author: 'Alice Chen', text: 'Permits approved', date: '2025-01-20' }, { id: 'n3', author: 'Alice Chen', text: 'Demo completed, starting tile work', date: '2025-02-15' }] },
  { id: 'm3', unitId: 'u5', tenantId: 't3', propertyId: 'p2', title: 'AC not cooling', description: 'Air conditioning runs but does not cool. Thermostat shows 78F when set to 68F.', priority: 'high', status: 'open', createdAt: '2025-03-01', updatedAt: '2025-03-01', assignedTo: null, estimatedCost: 500, actualCost: null, category: 'hvac', photos: [], notes: [] },
  { id: 'm4', unitId: 'u8', tenantId: 't5', propertyId: 'p3', title: 'Garage door opener broken', description: 'Electric garage door opener motor burned out. Door can be opened manually.', priority: 'medium', status: 'completed', createdAt: '2025-01-05', updatedAt: '2025-01-12', assignedTo: 'Dave Doors', estimatedCost: 400, actualCost: 350, category: 'electrical', photos: [], notes: [{ id: 'n4', author: 'Alice Chen', text: 'Replaced motor and remote', date: '2025-01-12' }] },
  { id: 'm5', unitId: 'u10', tenantId: 't6', propertyId: 'p4', title: 'Storefront window crack', description: 'Large crack in front display window, likely from thermal stress. Safety hazard.', priority: 'emergency', status: 'open', createdAt: '2025-03-05', updatedAt: '2025-03-05', assignedTo: null, estimatedCost: 2000, actualCost: null, category: 'structural', photos: [], notes: [] },
  { id: 'm6', unitId: 'u2', tenantId: 't2', propertyId: 'p1', title: 'Dishwasher not draining', description: 'Dishwasher fills with water but does not drain after cycle.', priority: 'medium', status: 'open', createdAt: '2025-03-08', updatedAt: '2025-03-08', assignedTo: null, estimatedCost: 200, actualCost: null, category: 'appliance', photos: [], notes: [] },
];

export default function PropertyManagement() {
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [units, setUnits] = useState(INITIAL_UNITS);
  const [tenants, setTenants] = useState(INITIAL_TENANTS);
  const [leases, setLeases] = useState(INITIAL_LEASES);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [maintenance, setMaintenance] = useState(INITIAL_MAINTENANCE);

  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [selectedLease, setSelectedLease] = useState(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);

  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  const [filterPropertyType, setFilterPropertyType] = useState('all');
  const [filterUnitStatus, setFilterUnitStatus] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [filterMaintenancePriority, setFilterMaintenancePriority] = useState('all');
  const [filterMaintenanceStatus, setFilterMaintenanceStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const [editingProperty, setEditingProperty] = useState(null);
  const [editingTenant, setEditingTenant] = useState(null);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [maintenanceNote, setMaintenanceNote] = useState('');

  const searchInputRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('propMgmtTheme');
    if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('propMgmtTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Cross-entity computed helpers
  const getPropertyUnits = useCallback((propertyId) => units.filter(u => u.propertyId === propertyId), [units]);
  const getUnitLease = useCallback((unitId) => leases.find(l => l.unitId === unitId && l.status === 'active'), [leases]);
  const getTenantLeases = useCallback((tenantId) => leases.filter(l => l.tenantId === tenantId), [leases]);
  const getLeasePayments = useCallback((leaseId) => payments.filter(p => p.leaseId === leaseId), [payments]);
  const getUnitMaintenance = useCallback((unitId) => maintenance.filter(m => m.unitId === unitId), [maintenance]);
  const getPropertyMaintenance = useCallback((propertyId) => maintenance.filter(m => m.propertyId === propertyId), [maintenance]);
  const getTenantByLease = useCallback((leaseId) => {
    const lease = leases.find(l => l.id === leaseId);
    return lease ? tenants.find(t => t.id === lease.tenantId) : null;
  }, [leases, tenants]);

  // Financial summaries
  const totalMonthlyRevenue = useMemo(() => {
    return leases.filter(l => l.status === 'active').reduce((sum, l) => sum + l.monthlyRent, 0);
  }, [leases]);

  const totalCollected = useMemo(() => {
    return payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const totalOverdue = useMemo(() => {
    return payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const occupancyRate = useMemo(() => {
    const occupied = units.filter(u => u.status === 'occupied').length;
    return units.length > 0 ? Math.round((occupied / units.length) * 100) : 0;
  }, [units]);

  const openMaintenanceCount = useMemo(() => {
    return maintenance.filter(m => m.status === 'open' || m.status === 'in_progress').length;
  }, [maintenance]);

  const maintenanceCostEstimate = useMemo(() => {
    return maintenance.filter(m => m.status !== 'cancelled').reduce((sum, m) => sum + (m.actualCost || m.estimatedCost || 0), 0);
  }, [maintenance]);

  // Per-property financial summary
  const propertyFinancials = useMemo(() => {
    const result = {};
    properties.forEach(p => {
      const pUnits = units.filter(u => u.propertyId === p.id);
      const pLeases = leases.filter(l => pUnits.some(u => u.id === l.unitId) && l.status === 'active');
      const pPayments = payments.filter(pay => pLeases.some(l => l.id === pay.leaseId));
      const occupiedCount = pUnits.filter(u => u.status === 'occupied').length;
      result[p.id] = {
        totalUnits: pUnits.length,
        occupiedUnits: occupiedCount,
        occupancyRate: pUnits.length > 0 ? Math.round((occupiedCount / pUnits.length) * 100) : 0,
        monthlyRevenue: pLeases.reduce((s, l) => s + l.monthlyRent, 0),
        collected: pPayments.filter(pay => pay.status === 'paid').reduce((s, pay) => s + pay.amount, 0),
        overdue: pPayments.filter(pay => pay.status === 'overdue').reduce((s, pay) => s + pay.amount, 0),
        openMaintenance: maintenance.filter(m => m.propertyId === p.id && (m.status === 'open' || m.status === 'in_progress')).length,
      };
    });
    return result;
  }, [properties, units, leases, payments, maintenance]);

  // Filtering & sorting
  const filteredProperties = useMemo(() => {
    let result = [...properties];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.manager.toLowerCase().includes(q));
    }
    if (filterPropertyType !== 'all') result = result.filter(p => p.type === filterPropertyType);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'units') cmp = a.units - b.units;
      else if (sortBy === 'type') cmp = a.type.localeCompare(b.type);
      else if (sortBy === 'revenue') cmp = (propertyFinancials[a.id]?.monthlyRevenue || 0) - (propertyFinancials[b.id]?.monthlyRevenue || 0);
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [properties, searchQuery, filterPropertyType, sortBy, sortDirection, propertyFinancials]);

  const filteredUnits = useMemo(() => {
    let result = selectedProperty ? units.filter(u => u.propertyId === selectedProperty.id) : [...units];
    if (filterUnitStatus !== 'all') result = result.filter(u => u.status === filterUnitStatus);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u => u.number.toLowerCase().includes(q));
    }
    return result;
  }, [units, selectedProperty, filterUnitStatus, searchQuery]);

  const filteredPayments = useMemo(() => {
    let result = [...payments];
    if (filterPaymentStatus !== 'all') result = result.filter(p => p.status === filterPaymentStatus);
    if (filterDateRange !== 'all') {
      const now = new Date();
      let startDate;
      if (filterDateRange === '30d') startDate = new Date(now.getTime() - 30 * DAY);
      else if (filterDateRange === '90d') startDate = new Date(now.getTime() - 90 * DAY);
      else if (filterDateRange === '1y') startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      if (startDate) result = result.filter(p => new Date(p.dueDate) >= startDate);
    }
    return result.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
  }, [payments, filterPaymentStatus, filterDateRange]);

  const filteredMaintenance = useMemo(() => {
    let result = [...maintenance];
    if (filterMaintenancePriority !== 'all') result = result.filter(m => m.priority === filterMaintenancePriority);
    if (filterMaintenanceStatus !== 'all') result = result.filter(m => m.status === filterMaintenanceStatus);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
    }
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [maintenance, filterMaintenancePriority, filterMaintenanceStatus, searchQuery]);

  // CRUD handlers
  const addProperty = (data) => {
    const id = 'p' + (properties.length + 1) + '_' + Date.now();
    setProperties([...properties, { ...data, id }]);
    setShowPropertyModal(false);
    setEditingProperty(null);
  };

  const updateProperty = (id, data) => {
    setProperties(properties.map(p => p.id === id ? { ...p, ...data } : p));
    setShowPropertyModal(false);
    setEditingProperty(null);
  };

  const deleteProperty = (id) => {
    if (window.confirm('Delete this property and all associated units, leases, and records?')) {
      const unitIds = units.filter(u => u.propertyId === id).map(u => u.id);
      const leaseIds = leases.filter(l => unitIds.includes(l.unitId)).map(l => l.id);
      setPayments(payments.filter(p => !leaseIds.includes(p.leaseId)));
      setMaintenance(maintenance.filter(m => m.propertyId !== id));
      setLeases(leases.filter(l => !leaseIds.includes(l.id)));
      setUnits(units.filter(u => u.propertyId !== id));
      setProperties(properties.filter(p => p.id !== id));
      if (selectedProperty?.id === id) setSelectedProperty(null);
    }
  };

  const addTenant = (data) => {
    const id = 't' + (tenants.length + 1) + '_' + Date.now();
    setTenants([...tenants, { ...data, id, pets: [], vehicles: [], notes: '' }]);
    setShowTenantModal(false);
    setEditingTenant(null);
  };

  const updateTenant = (id, data) => {
    setTenants(tenants.map(t => t.id === id ? { ...t, ...data } : t));
    setShowTenantModal(false);
    setEditingTenant(null);
  };

  const addPayment = (data) => {
    const id = 'pay' + (payments.length + 1) + '_' + Date.now();
    setPayments([...payments, { ...data, id }]);
    setShowPaymentModal(false);
  };

  const addMaintenanceRequest = (data) => {
    const id = 'm' + (maintenance.length + 1) + '_' + Date.now();
    const now = new Date().toISOString().split('T')[0];
    setMaintenance([...maintenance, { ...data, id, createdAt: now, updatedAt: now, photos: [], notes: [] }]);
    setShowMaintenanceModal(false);
  };

  const updateMaintenanceStatus = (id, newStatus) => {
    const now = new Date().toISOString().split('T')[0];
    setMaintenance(maintenance.map(m => m.id === id ? { ...m, status: newStatus, updatedAt: now } : m));
  };

  const addMaintenanceNote = (id) => {
    if (!maintenanceNote.trim()) return;
    const now = new Date().toISOString().split('T')[0];
    setMaintenance(maintenance.map(m => m.id === id ? {
      ...m,
      notes: [...m.notes, { id: 'n' + Date.now(), author: 'Current User', text: maintenanceNote, date: now }],
      updatedAt: now,
    } : m));
    setMaintenanceNote('');
  };

  const bg = isDarkMode ? '#1a1a2e' : '#f0f2f5';
  const cardBg = isDarkMode ? '#16213e' : '#ffffff';
  const textColor = isDarkMode ? '#e0e0e0' : '#333333';
  const mutedText = isDarkMode ? '#8899aa' : '#666666';
  const borderColor = isDarkMode ? '#2a2a4a' : '#e0e0e0';
  const accentColor = '#3b82f6';
  const sidebarBg = isDarkMode ? '#0f0f23' : '#1e293b';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'properties', label: 'Properties', icon: '🏢' },
    { id: 'units', label: 'Units', icon: '🚪' },
    { id: 'tenants', label: 'Tenants', icon: '👥' },
    { id: 'leases', label: 'Leases', icon: '📄' },
    { id: 'payments', label: 'Payments', icon: '💰' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
  ];

  // ——— Renderers ———

  const renderSidebar = () => (
    <div data-testid="sidebar" style={{ width: sidebarCollapsed ? 60 : 240, background: sidebarBg, color: '#fff', padding: '16px 0', display: 'flex', flexDirection: 'column', transition: 'width 0.2s', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ padding: '0 16px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!sidebarCollapsed && <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>PropManager</h1>}
        <button data-testid="toggle-sidebar" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18 }}>{sidebarCollapsed ? '→' : '←'}</button>
      </div>
      <nav style={{ flex: 1 }}>
        {navItems.map(item => (
          <button key={item.id} data-testid={`nav-${item.id}`} onClick={() => { setActiveView(item.id); setSelectedProperty(null); setSelectedUnit(null); setSelectedTenant(null); setSelectedLease(null); setSelectedMaintenance(null); }} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 16px', border: 'none', background: activeView === item.id ? 'rgba(59,130,246,0.3)' : 'transparent', color: activeView === item.id ? '#60a5fa' : '#94a3b8', cursor: 'pointer', fontSize: 14, textAlign: 'left', borderLeft: activeView === item.id ? '3px solid #3b82f6' : '3px solid transparent' }}>
            <span>{item.icon}</span>
            {!sidebarCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
      {!sidebarCollapsed && (
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: '#64748b' }}>
          <div>Occupancy: <strong style={{ color: '#22c55e' }}>{occupancyRate}%</strong></div>
          <div>Monthly Rev: <strong style={{ color: '#60a5fa' }}>${totalMonthlyRevenue.toLocaleString()}</strong></div>
          <div>Open Tickets: <strong style={{ color: openMaintenanceCount > 0 ? '#f97316' : '#22c55e' }}>{openMaintenanceCount}</strong></div>
        </div>
      )}
      <button data-testid="toggle-theme" onClick={() => setIsDarkMode(!isDarkMode)} style={{ margin: '8px 16px', padding: '8px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 14 }}>{isDarkMode ? '☀️ Light' : '🌙 Dark'}</button>
    </div>
  );

  const renderHeader = () => (
    <div data-testid="header" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', borderBottom: `1px solid ${borderColor}`, background: cardBg }}>
      <input ref={searchInputRef} data-testid="search-input" type="text" placeholder="Search... (Ctrl+K)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flex: 1, maxWidth: 400, padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor, fontSize: 14 }} />
      {activeView === 'properties' && (
        <select data-testid="filter-property-type" aria-label="Filter by property type" value={filterPropertyType} onChange={e => setFilterPropertyType(e.target.value)} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }}>
          <option value="all">All Types</option>
          {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      )}
      {activeView === 'units' && (
        <select data-testid="filter-unit-status" aria-label="Filter by unit status" value={filterUnitStatus} onChange={e => setFilterUnitStatus(e.target.value)} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }}>
          <option value="all">All Statuses</option>
          {UNIT_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      )}
      {activeView === 'payments' && (
        <>
          <select data-testid="filter-payment-status" aria-label="Filter by payment status" value={filterPaymentStatus} onChange={e => setFilterPaymentStatus(e.target.value)} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }}>
            <option value="all">All Payments</option>
            {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select data-testid="filter-date-range" aria-label="Filter by date range" value={filterDateRange} onChange={e => setFilterDateRange(e.target.value)} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }}>
            <option value="all">All Time</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </>
      )}
      {activeView === 'maintenance' && (
        <>
          <select data-testid="filter-maintenance-priority" aria-label="Filter by maintenance priority" value={filterMaintenancePriority} onChange={e => setFilterMaintenancePriority(e.target.value)} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }}>
            <option value="all">All Priorities</option>
            {MAINTENANCE_PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <select data-testid="filter-maintenance-status" aria-label="Filter by maintenance status" value={filterMaintenanceStatus} onChange={e => setFilterMaintenanceStatus(e.target.value)} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }}>
            <option value="all">All Statuses</option>
            {MAINTENANCE_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
          </select>
        </>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div data-testid="dashboard-view" style={{ padding: 24 }}>
      <h2 style={{ color: textColor, marginBottom: 20, fontSize: 22 }}>Dashboard Overview</h2>
      <div data-testid="kpi-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div data-testid="kpi-occupancy" style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 16 }}>
          <div style={{ color: mutedText, fontSize: 12, marginBottom: 4 }}>Occupancy Rate</div>
          <div style={{ color: textColor, fontSize: 28, fontWeight: 700 }}>{occupancyRate}%</div>
          <div style={{ color: mutedText, fontSize: 12 }}>{units.filter(u => u.status === 'occupied').length} / {units.length} units</div>
        </div>
        <div data-testid="kpi-revenue" style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 16 }}>
          <div style={{ color: mutedText, fontSize: 12, marginBottom: 4 }}>Monthly Revenue</div>
          <div style={{ color: textColor, fontSize: 28, fontWeight: 700 }}>${totalMonthlyRevenue.toLocaleString()}</div>
          <div style={{ color: mutedText, fontSize: 12 }}>{leases.filter(l => l.status === 'active').length} active leases</div>
        </div>
        <div data-testid="kpi-collected" style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 16 }}>
          <div style={{ color: mutedText, fontSize: 12, marginBottom: 4 }}>Total Collected</div>
          <div style={{ color: '#22c55e', fontSize: 28, fontWeight: 700 }}>${totalCollected.toLocaleString()}</div>
          <div style={{ color: mutedText, fontSize: 12 }}>{payments.filter(p => p.status === 'paid').length} payments received</div>
        </div>
        <div data-testid="kpi-overdue" style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 16 }}>
          <div style={{ color: mutedText, fontSize: 12, marginBottom: 4 }}>Overdue Amount</div>
          <div style={{ color: '#dc2626', fontSize: 28, fontWeight: 700 }}>${totalOverdue.toLocaleString()}</div>
          <div style={{ color: mutedText, fontSize: 12 }}>{payments.filter(p => p.status === 'overdue').length} overdue payments</div>
        </div>
        <div data-testid="kpi-maintenance" style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 16 }}>
          <div style={{ color: mutedText, fontSize: 12, marginBottom: 4 }}>Open Maintenance</div>
          <div style={{ color: openMaintenanceCount > 0 ? '#f97316' : '#22c55e', fontSize: 28, fontWeight: 700 }}>{openMaintenanceCount}</div>
          <div style={{ color: mutedText, fontSize: 12 }}>Est. cost: ${maintenanceCostEstimate.toLocaleString()}</div>
        </div>
        <div data-testid="kpi-properties" style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 16 }}>
          <div style={{ color: mutedText, fontSize: 12, marginBottom: 4 }}>Properties</div>
          <div style={{ color: textColor, fontSize: 28, fontWeight: 700 }}>{properties.length}</div>
          <div style={{ color: mutedText, fontSize: 12 }}>{units.length} total units</div>
        </div>
      </div>
      <h3 style={{ color: textColor, marginBottom: 12, fontSize: 16 }}>Property Performance</h3>
      <div data-testid="property-performance-table" style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: textColor }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${borderColor}`, background: bg }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Property</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Units</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Occupancy</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Monthly Rev</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Collected</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Overdue</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Maint.</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(p => {
              const fin = propertyFinancials[p.id] || {};
              return (
                <tr key={p.id} style={{ borderBottom: `1px solid ${borderColor}`, cursor: 'pointer' }} onClick={() => { setSelectedProperty(p); setActiveView('properties'); }}>
                  <td style={{ padding: '10px 12px' }}>{p.name}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{fin.occupiedUnits}/{fin.totalUnits}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}><span style={{ color: fin.occupancyRate >= 80 ? '#22c55e' : fin.occupancyRate >= 50 ? '#eab308' : '#dc2626' }}>{fin.occupancyRate}%</span></td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>${(fin.monthlyRevenue || 0).toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: '#22c55e' }}>${(fin.collected || 0).toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: fin.overdue > 0 ? '#dc2626' : mutedText }}>${(fin.overdue || 0).toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: fin.openMaintenance > 0 ? '#f97316' : '#22c55e' }}>{fin.openMaintenance}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <h3 style={{ color: textColor, margin: '24px 0 12px', fontSize: 16 }}>Recent Maintenance Requests</h3>
      <div data-testid="recent-maintenance" style={{ display: 'grid', gap: 8 }}>
        {maintenance.filter(m => m.status !== 'completed' && m.status !== 'cancelled').slice(0, 5).map(m => {
          const prop = properties.find(p => p.id === m.propertyId);
          const unit = units.find(u => u.id === m.unitId);
          return (
            <div key={m.id} data-testid={`maint-card-${m.id}`} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', borderLeft: `4px solid ${PRIORITY_COLORS[m.priority]}` }} onClick={() => { setSelectedMaintenance(m); setActiveView('maintenance'); }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</div>
                <div style={{ color: mutedText, fontSize: 12 }}>{prop?.name} — Unit {unit?.number} | {m.category}</div>
              </div>
              <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: PRIORITY_COLORS[m.priority] + '22', color: PRIORITY_COLORS[m.priority] }}>{m.priority}</span>
              <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: m.status === 'open' ? '#3b82f622' : '#eab30822', color: m.status === 'open' ? '#3b82f6' : '#eab308' }}>{m.status.replace('_', ' ')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderProperties = () => (
    <div data-testid="properties-view" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: textColor, fontSize: 22, margin: 0 }}>Properties</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <select data-testid="sort-by" aria-label="Sort by" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }}>
            <option value="name">Name</option>
            <option value="units">Units</option>
            <option value="type">Type</option>
            <option value="revenue">Revenue</option>
          </select>
          <button data-testid="sort-direction" onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')} style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor, cursor: 'pointer' }}>{sortDirection === 'asc' ? '↑' : '↓'}</button>
          <button data-testid="add-property-btn" onClick={() => { setEditingProperty(null); setShowPropertyModal(true); }} style={{ padding: '8px 16px', background: accentColor, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>+ Add Property</button>
        </div>
      </div>
      {selectedProperty ? renderPropertyDetail() : (
        <div data-testid="property-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filteredProperties.map(p => {
            const fin = propertyFinancials[p.id] || {};
            return (
              <div key={p.id} data-testid={`property-card-${p.id}`} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 16, cursor: 'pointer' }} onClick={() => setSelectedProperty(p)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h3 style={{ color: textColor, margin: 0, fontSize: 16 }}>{p.name}</h3>
                  <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: accentColor + '22', color: accentColor }}>{p.type}</span>
                </div>
                <div style={{ color: mutedText, fontSize: 12, marginBottom: 8 }}>{p.address}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                  <div><span style={{ color: mutedText }}>Units:</span> <strong style={{ color: textColor }}>{fin.occupiedUnits}/{fin.totalUnits}</strong></div>
                  <div><span style={{ color: mutedText }}>Occupancy:</span> <strong style={{ color: fin.occupancyRate >= 80 ? '#22c55e' : '#eab308' }}>{fin.occupancyRate}%</strong></div>
                  <div><span style={{ color: mutedText }}>Revenue:</span> <strong style={{ color: textColor }}>${(fin.monthlyRevenue || 0).toLocaleString()}</strong></div>
                  <div><span style={{ color: mutedText }}>Maint:</span> <strong style={{ color: fin.openMaintenance > 0 ? '#f97316' : '#22c55e' }}>{fin.openMaintenance} open</strong></div>
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: mutedText }}>Manager: {p.manager}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderPropertyDetail = () => {
    const p = selectedProperty;
    const pUnits = getPropertyUnits(p.id);
    const pMaint = getPropertyMaintenance(p.id);
    const fin = propertyFinancials[p.id] || {};
    return (
      <div data-testid="property-detail">
        <button data-testid="back-to-properties" onClick={() => setSelectedProperty(null)} style={{ background: 'none', border: 'none', color: accentColor, cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0 }}>← Back to Properties</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ color: textColor, margin: 0 }}>{p.name}</h2>
            <div style={{ color: mutedText, fontSize: 13 }}>{p.address}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button data-testid="edit-property-btn" onClick={() => { setEditingProperty(p); setShowPropertyModal(true); }} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor, cursor: 'pointer' }}>Edit</button>
            <button data-testid="delete-property-btn" onClick={() => deleteProperty(p.id)} style={{ padding: '6px 12px', border: '1px solid #dc2626', borderRadius: 6, background: 'transparent', color: '#dc2626', cursor: 'pointer' }}>Delete</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
          <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 12, textAlign: 'center' }}><div style={{ color: mutedText, fontSize: 11 }}>Type</div><div style={{ color: textColor, fontWeight: 600 }}>{p.type}</div></div>
          <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 12, textAlign: 'center' }}><div style={{ color: mutedText, fontSize: 11 }}>Year Built</div><div style={{ color: textColor, fontWeight: 600 }}>{p.yearBuilt}</div></div>
          <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 12, textAlign: 'center' }}><div style={{ color: mutedText, fontSize: 11 }}>Sq Ft</div><div style={{ color: textColor, fontWeight: 600 }}>{p.sqft.toLocaleString()}</div></div>
          <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 12, textAlign: 'center' }}><div style={{ color: mutedText, fontSize: 11 }}>Occupancy</div><div style={{ color: fin.occupancyRate >= 80 ? '#22c55e' : '#eab308', fontWeight: 600 }}>{fin.occupancyRate}%</div></div>
          <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 12, textAlign: 'center' }}><div style={{ color: mutedText, fontSize: 11 }}>Monthly Rev</div><div style={{ color: textColor, fontWeight: 600 }}>${(fin.monthlyRevenue || 0).toLocaleString()}</div></div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {p.amenities.map(a => <span key={a} style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, background: accentColor + '15', color: accentColor }}>{a.replace('_', ' ')}</span>)}
        </div>
        <h3 style={{ color: textColor, margin: '16px 0 12px' }}>Units ({pUnits.length})</h3>
        <div data-testid="property-units" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginBottom: 20 }}>
          {pUnits.map(u => {
            const activeLease = getUnitLease(u.id);
            const tenant = activeLease ? tenants.find(t => t.id === activeLease.tenantId) : null;
            return (
              <div key={u.id} data-testid={`unit-card-${u.id}`} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 12, borderLeft: `4px solid ${STATUS_COLORS[u.status]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <strong style={{ color: textColor }}>Unit {u.number}</strong>
                  <span style={{ padding: '2px 6px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: STATUS_COLORS[u.status] + '22', color: STATUS_COLORS[u.status] }}>{u.status}</span>
                </div>
                <div style={{ fontSize: 12, color: mutedText }}>{u.bedrooms}BR / {u.bathrooms}BA • {u.sqft} sqft</div>
                <div style={{ fontSize: 13, color: textColor, fontWeight: 600, marginTop: 4 }}>${u.rent.toLocaleString()}/mo</div>
                {tenant && <div style={{ fontSize: 12, color: mutedText, marginTop: 4 }}>Tenant: {tenant.firstName} {tenant.lastName}</div>}
              </div>
            );
          })}
        </div>
        {p.notes && <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 12, fontSize: 13, color: mutedText }}><strong style={{ color: textColor }}>Notes:</strong> {p.notes}</div>}
        <h3 style={{ color: textColor, margin: '16px 0 12px' }}>Maintenance ({pMaint.length})</h3>
        {pMaint.length === 0 ? <div style={{ color: mutedText, fontSize: 13 }}>No maintenance requests for this property.</div> : pMaint.map(m => (
          <div key={m.id} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 12, marginBottom: 8, borderLeft: `4px solid ${PRIORITY_COLORS[m.priority]}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong style={{ color: textColor, fontSize: 14 }}>{m.title}</strong><span style={{ fontSize: 11, color: PRIORITY_COLORS[m.priority] }}>{m.priority}</span></div>
            <div style={{ color: mutedText, fontSize: 12 }}>Unit {units.find(u => u.id === m.unitId)?.number} | {m.status.replace('_', ' ')} | {m.category}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderUnits = () => (
    <div data-testid="units-view" style={{ padding: 24 }}>
      <h2 style={{ color: textColor, marginBottom: 20, fontSize: 22 }}>All Units</h2>
      <div data-testid="units-table" style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: textColor, minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${borderColor}`, background: bg }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Property</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Unit</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Bed/Bath</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Sq Ft</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Rent</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Tenant</th>
            </tr>
          </thead>
          <tbody>
            {filteredUnits.map(u => {
              const prop = properties.find(p => p.id === u.propertyId);
              const activeLease = getUnitLease(u.id);
              const tenant = activeLease ? tenants.find(t => t.id === activeLease.tenantId) : null;
              return (
                <tr key={u.id} data-testid={`unit-row-${u.id}`} style={{ borderBottom: `1px solid ${borderColor}` }}>
                  <td style={{ padding: '10px 12px' }}>{prop?.name}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{u.number}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{u.bedrooms}/{u.bathrooms}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>{u.sqft.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>${u.rent.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}><span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: STATUS_COLORS[u.status] + '22', color: STATUS_COLORS[u.status] }}>{u.status}</span></td>
                  <td style={{ padding: '10px 12px' }}>{tenant ? `${tenant.firstName} ${tenant.lastName}` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTenants = () => (
    <div data-testid="tenants-view" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: textColor, fontSize: 22, margin: 0 }}>Tenants</h2>
        <button data-testid="add-tenant-btn" onClick={() => { setEditingTenant(null); setShowTenantModal(true); }} style={{ padding: '8px 16px', background: accentColor, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>+ Add Tenant</button>
      </div>
      {selectedTenant ? renderTenantDetail() : (
        <div data-testid="tenant-list" style={{ display: 'grid', gap: 12 }}>
          {tenants.filter(t => !searchQuery || `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || t.email.toLowerCase().includes(searchQuery.toLowerCase())).map(t => {
            const tLeases = getTenantLeases(t.id);
            const activeLeases = tLeases.filter(l => l.status === 'active');
            return (
              <div key={t.id} data-testid={`tenant-card-${t.id}`} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }} onClick={() => setSelectedTenant(t)}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: accentColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: accentColor, fontSize: 18 }}>{t.firstName[0]}{t.lastName[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: textColor, fontWeight: 600 }}>{t.firstName} {t.lastName}</div>
                  <div style={{ color: mutedText, fontSize: 12 }}>{t.email} | {t.phone}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, color: mutedText }}>
                  <div>{activeLeases.length} active lease{activeLeases.length !== 1 ? 's' : ''}</div>
                  {t.creditScore && <div>Credit: {t.creditScore}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderTenantDetail = () => {
    const t = selectedTenant;
    const tLeases = getTenantLeases(t.id);
    const tPayments = payments.filter(p => p.tenantId === t.id);
    return (
      <div data-testid="tenant-detail">
        <button data-testid="back-to-tenants" onClick={() => setSelectedTenant(null)} style={{ background: 'none', border: 'none', color: accentColor, cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0 }}>← Back to Tenants</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ color: textColor, margin: 0 }}>{t.firstName} {t.lastName}</h2>
          <button data-testid="edit-tenant-btn" onClick={() => { setEditingTenant(t); setShowTenantModal(true); }} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor, cursor: 'pointer' }}>Edit</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 16 }}>
            <h4 style={{ color: textColor, marginTop: 0 }}>Contact Info</h4>
            <div style={{ fontSize: 13, color: mutedText, lineHeight: 1.8 }}>
              <div>Email: <span style={{ color: textColor }}>{t.email}</span></div>
              <div>Phone: <span style={{ color: textColor }}>{t.phone}</span></div>
              <div>Emergency: <span style={{ color: textColor }}>{t.emergencyContact}</span></div>
              <div>Move-in: <span style={{ color: textColor }}>{t.moveInDate}</span></div>
              {t.creditScore && <div>Credit Score: <span style={{ color: textColor }}>{t.creditScore}</span></div>}
            </div>
          </div>
          <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 16 }}>
            <h4 style={{ color: textColor, marginTop: 0 }}>Pets & Vehicles</h4>
            {t.pets.length > 0 ? t.pets.map((pet, i) => <div key={i} style={{ fontSize: 13, color: mutedText }}>{pet.type}: {pet.name} ({pet.breed})</div>) : <div style={{ fontSize: 13, color: mutedText }}>No pets on file</div>}
            {t.vehicles.length > 0 ? t.vehicles.map((v, i) => <div key={i} style={{ fontSize: 13, color: mutedText, marginTop: 4 }}>{v.year} {v.make} {v.model} — {v.plate}</div>) : <div style={{ fontSize: 13, color: mutedText, marginTop: 8 }}>No vehicles on file</div>}
          </div>
        </div>
        <h3 style={{ color: textColor }}>Leases</h3>
        {tLeases.map(l => {
          const unit = units.find(u => u.id === l.unitId);
          const prop = unit ? properties.find(p => p.id === unit.propertyId) : null;
          return (
            <div key={l.id} data-testid={`tenant-lease-${l.id}`} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ color: textColor }}>{prop?.name} — Unit {unit?.number}</strong>
                <span style={{ color: l.status === 'active' ? '#22c55e' : l.status === 'expired' ? '#dc2626' : '#eab308' }}>{l.status}</span>
              </div>
              <div style={{ color: mutedText }}>{l.startDate} to {l.endDate} | ${l.monthlyRent.toLocaleString()}/mo</div>
            </div>
          );
        })}
        <h3 style={{ color: textColor }}>Payment History</h3>
        <div data-testid="tenant-payments" style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, color: textColor }}>
            <thead><tr style={{ borderBottom: `1px solid ${borderColor}`, background: bg }}><th style={{ padding: '8px' }}>Due Date</th><th style={{ padding: '8px' }}>Amount</th><th style={{ padding: '8px' }}>Status</th><th style={{ padding: '8px' }}>Method</th></tr></thead>
            <tbody>
              {tPayments.map(p => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                  <td style={{ padding: '8px' }}>{p.dueDate}</td>
                  <td style={{ padding: '8px' }}>${p.amount.toLocaleString()}</td>
                  <td style={{ padding: '8px' }}><span style={{ color: PAYMENT_COLORS[p.status] }}>{p.status}</span></td>
                  <td style={{ padding: '8px' }}>{p.method || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderLeases = () => (
    <div data-testid="leases-view" style={{ padding: 24 }}>
      <h2 style={{ color: textColor, marginBottom: 20, fontSize: 22 }}>Leases</h2>
      <div data-testid="leases-table" style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: textColor, minWidth: 800 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${borderColor}`, background: bg }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Property / Unit</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Tenant</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Start</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>End</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Rent</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Auto-Renew</th>
            </tr>
          </thead>
          <tbody>
            {leases.map(l => {
              const unit = units.find(u => u.id === l.unitId);
              const prop = unit ? properties.find(p => p.id === unit.propertyId) : null;
              const tenant = tenants.find(t => t.id === l.tenantId);
              return (
                <tr key={l.id} data-testid={`lease-row-${l.id}`} style={{ borderBottom: `1px solid ${borderColor}` }}>
                  <td style={{ padding: '10px 12px' }}>{prop?.name} — {unit?.number}</td>
                  <td style={{ padding: '10px 12px' }}>{tenant ? `${tenant.firstName} ${tenant.lastName}` : '—'}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{l.startDate}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{l.endDate}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>${l.monthlyRent.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}><span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: l.status === 'active' ? '#22c55e22' : l.status === 'expired' ? '#dc262622' : '#eab30822', color: l.status === 'active' ? '#22c55e' : l.status === 'expired' ? '#dc2626' : '#eab308' }}>{l.status}</span></td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{l.autoRenew ? '✓' : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div data-testid="payments-view" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: textColor, fontSize: 22, margin: 0 }}>Payments</h2>
        <button data-testid="record-payment-btn" onClick={() => setShowPaymentModal(true)} style={{ padding: '8px 16px', background: accentColor, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>+ Record Payment</button>
      </div>
      <div data-testid="payment-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 12, textAlign: 'center' }}><div style={{ color: mutedText, fontSize: 11 }}>Paid</div><div style={{ color: '#22c55e', fontSize: 20, fontWeight: 700 }}>{filteredPayments.filter(p => p.status === 'paid').length}</div></div>
        <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 12, textAlign: 'center' }}><div style={{ color: mutedText, fontSize: 11 }}>Pending</div><div style={{ color: '#eab308', fontSize: 20, fontWeight: 700 }}>{filteredPayments.filter(p => p.status === 'pending').length}</div></div>
        <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 12, textAlign: 'center' }}><div style={{ color: mutedText, fontSize: 11 }}>Overdue</div><div style={{ color: '#dc2626', fontSize: 20, fontWeight: 700 }}>{filteredPayments.filter(p => p.status === 'overdue').length}</div></div>
        <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 12, textAlign: 'center' }}><div style={{ color: mutedText, fontSize: 11 }}>Partial</div><div style={{ color: '#f97316', fontSize: 20, fontWeight: 700 }}>{filteredPayments.filter(p => p.status === 'partial').length}</div></div>
      </div>
      <div data-testid="payments-table" style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: textColor, minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${borderColor}`, background: bg }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Tenant</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Due Date</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Paid Date</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Method</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Reference</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map(p => {
              const tenant = tenants.find(t => t.id === p.tenantId);
              return (
                <tr key={p.id} data-testid={`payment-row-${p.id}`} style={{ borderBottom: `1px solid ${borderColor}` }}>
                  <td style={{ padding: '10px 12px' }}>{tenant ? `${tenant.firstName} ${tenant.lastName}` : '—'}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{p.dueDate}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{p.date || '—'}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>${p.amount.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}><span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: PAYMENT_COLORS[p.status] + '22', color: PAYMENT_COLORS[p.status] }}>{p.status}</span></td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{p.method || '—'}</td>
                  <td style={{ padding: '10px 12px' }}>{p.reference || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMaintenance = () => (
    <div data-testid="maintenance-view" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: textColor, fontSize: 22, margin: 0 }}>Maintenance</h2>
        <button data-testid="add-maintenance-btn" onClick={() => { setEditingMaintenance(null); setShowMaintenanceModal(true); }} style={{ padding: '8px 16px', background: accentColor, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>+ New Request</button>
      </div>
      {selectedMaintenance ? renderMaintenanceDetail() : (
        <div data-testid="maintenance-list" style={{ display: 'grid', gap: 12 }}>
          {filteredMaintenance.map(m => {
            const prop = properties.find(p => p.id === m.propertyId);
            const unit = units.find(u => u.id === m.unitId);
            const tenant = m.tenantId ? tenants.find(t => t.id === m.tenantId) : null;
            return (
              <div key={m.id} data-testid={`maint-item-${m.id}`} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 16, cursor: 'pointer', borderLeft: `4px solid ${PRIORITY_COLORS[m.priority]}` }} onClick={() => setSelectedMaintenance(m)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <h4 style={{ color: textColor, margin: 0, fontSize: 15 }}>{m.title}</h4>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: PRIORITY_COLORS[m.priority] + '22', color: PRIORITY_COLORS[m.priority] }}>{m.priority}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: m.status === 'completed' ? '#22c55e22' : m.status === 'in_progress' ? '#eab30822' : '#3b82f622', color: m.status === 'completed' ? '#22c55e' : m.status === 'in_progress' ? '#eab308' : '#3b82f6' }}>{m.status.replace('_', ' ')}</span>
                  </div>
                </div>
                <div style={{ color: mutedText, fontSize: 12 }}>{prop?.name} — Unit {unit?.number} | {m.category} {tenant ? `| ${tenant.firstName} ${tenant.lastName}` : ''}</div>
                <div style={{ color: mutedText, fontSize: 11, marginTop: 4 }}>Created: {m.createdAt} {m.assignedTo ? `| Assigned: ${m.assignedTo}` : ''} | Est: ${(m.estimatedCost || 0).toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderMaintenanceDetail = () => {
    const m = selectedMaintenance;
    const prop = properties.find(p => p.id === m.propertyId);
    const unit = units.find(u => u.id === m.unitId);
    const tenant = m.tenantId ? tenants.find(t => t.id === m.tenantId) : null;
    return (
      <div data-testid="maintenance-detail">
        <button data-testid="back-to-maintenance" onClick={() => setSelectedMaintenance(null)} style={{ background: 'none', border: 'none', color: accentColor, cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0 }}>← Back to Maintenance</button>
        <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <h2 style={{ color: textColor, margin: 0 }}>{m.title}</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              {MAINTENANCE_STATUSES.filter(s => s !== m.status).map(s => (
                <button key={s} data-testid={`set-status-${s}`} onClick={() => { updateMaintenanceStatus(m.id, s); setSelectedMaintenance({ ...m, status: s }); }} style={{ padding: '4px 10px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor, cursor: 'pointer', fontSize: 12 }}>{s.replace('_', ' ')}</button>
              ))}
            </div>
          </div>
          <p style={{ color: mutedText, fontSize: 14, margin: '8px 0' }}>{m.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 16, fontSize: 13 }}>
            <div><span style={{ color: mutedText }}>Property:</span> <span style={{ color: textColor }}>{prop?.name}</span></div>
            <div><span style={{ color: mutedText }}>Unit:</span> <span style={{ color: textColor }}>{unit?.number}</span></div>
            <div><span style={{ color: mutedText }}>Tenant:</span> <span style={{ color: textColor }}>{tenant ? `${tenant.firstName} ${tenant.lastName}` : 'N/A'}</span></div>
            <div><span style={{ color: mutedText }}>Category:</span> <span style={{ color: textColor }}>{m.category}</span></div>
            <div><span style={{ color: mutedText }}>Priority:</span> <span style={{ color: PRIORITY_COLORS[m.priority] }}>{m.priority}</span></div>
            <div><span style={{ color: mutedText }}>Status:</span> <span style={{ color: textColor }}>{m.status.replace('_', ' ')}</span></div>
            <div><span style={{ color: mutedText }}>Assigned:</span> <span style={{ color: textColor }}>{m.assignedTo || 'Unassigned'}</span></div>
            <div><span style={{ color: mutedText }}>Est. Cost:</span> <span style={{ color: textColor }}>${(m.estimatedCost || 0).toLocaleString()}</span></div>
            {m.actualCost !== null && <div><span style={{ color: mutedText }}>Actual Cost:</span> <span style={{ color: textColor }}>${m.actualCost.toLocaleString()}</span></div>}
            <div><span style={{ color: mutedText }}>Created:</span> <span style={{ color: textColor }}>{m.createdAt}</span></div>
            <div><span style={{ color: mutedText }}>Updated:</span> <span style={{ color: textColor }}>{m.updatedAt}</span></div>
          </div>
        </div>
        <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 20 }}>
          <h3 style={{ color: textColor, marginTop: 0 }}>Notes ({m.notes.length})</h3>
          {m.notes.map(n => (
            <div key={n.id} style={{ borderBottom: `1px solid ${borderColor}`, padding: '8px 0', fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong style={{ color: textColor }}>{n.author}</strong><span style={{ color: mutedText, fontSize: 11 }}>{n.date}</span></div>
              <div style={{ color: mutedText, marginTop: 2 }}>{n.text}</div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input data-testid="maintenance-note-input" type="text" placeholder="Add a note..." value={maintenanceNote} onChange={e => setMaintenanceNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMaintenanceNote(m.id)} style={{ flex: 1, padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
            <button data-testid="add-note-btn" onClick={() => addMaintenanceNote(m.id)} style={{ padding: '8px 16px', background: accentColor, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Add</button>
          </div>
        </div>
      </div>
    );
  };

  const renderPropertyModal = () => {
    if (!showPropertyModal) return null;
    const isEdit = !!editingProperty;
    const [form, setForm] = [
      isEdit ? { ...editingProperty } : { name: '', address: '', type: 'apartment', units: 1, yearBuilt: 2024, sqft: 1000, amenities: [], manager: '', managerPhone: '', managerEmail: '', notes: '' },
      (v) => isEdit ? setEditingProperty(typeof v === 'function' ? v(editingProperty) : v) : null,
    ];
    return (
      <div data-testid="property-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: cardBg, borderRadius: 12, padding: 24, width: 480, maxHeight: '80vh', overflow: 'auto' }}>
          <h3 style={{ color: textColor, marginTop: 0 }}>{isEdit ? 'Edit Property' : 'Add Property'}</h3>
          <form data-testid="property-form" onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); const data = { name: fd.get('name'), address: fd.get('address'), type: fd.get('type'), units: parseInt(fd.get('units')), yearBuilt: parseInt(fd.get('yearBuilt')), sqft: parseInt(fd.get('sqft')), amenities: [], manager: fd.get('manager'), managerPhone: fd.get('managerPhone'), managerEmail: fd.get('managerEmail'), notes: fd.get('notes'), image: null }; isEdit ? updateProperty(editingProperty.id, data) : addProperty(data); }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <input name="name" placeholder="Property name" defaultValue={isEdit ? editingProperty.name : ''} required style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
              <input name="address" placeholder="Address" defaultValue={isEdit ? editingProperty.address : ''} required style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
              <select name="type" defaultValue={isEdit ? editingProperty.type : 'apartment'} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }}>{PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <input name="units" type="number" placeholder="Units" defaultValue={isEdit ? editingProperty.units : 1} min={1} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
                <input name="yearBuilt" type="number" placeholder="Year built" defaultValue={isEdit ? editingProperty.yearBuilt : 2024} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
                <input name="sqft" type="number" placeholder="Sq ft" defaultValue={isEdit ? editingProperty.sqft : 1000} min={1} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
              </div>
              <input name="manager" placeholder="Manager name" defaultValue={isEdit ? editingProperty.manager : ''} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input name="managerPhone" placeholder="Manager phone" defaultValue={isEdit ? editingProperty.managerPhone : ''} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
                <input name="managerEmail" placeholder="Manager email" defaultValue={isEdit ? editingProperty.managerEmail : ''} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
              </div>
              <textarea name="notes" placeholder="Notes" defaultValue={isEdit ? editingProperty.notes : ''} rows={2} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button type="button" data-testid="cancel-property-modal" onClick={() => { setShowPropertyModal(false); setEditingProperty(null); }} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" data-testid="save-property-btn" style={{ padding: '8px 16px', background: accentColor, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{isEdit ? 'Save Changes' : 'Add Property'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderTenantModal = () => {
    if (!showTenantModal) return null;
    const isEdit = !!editingTenant;
    return (
      <div data-testid="tenant-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: cardBg, borderRadius: 12, padding: 24, width: 480, maxHeight: '80vh', overflow: 'auto' }}>
          <h3 style={{ color: textColor, marginTop: 0 }}>{isEdit ? 'Edit Tenant' : 'Add Tenant'}</h3>
          <form data-testid="tenant-form" onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); const data = { firstName: fd.get('firstName'), lastName: fd.get('lastName'), email: fd.get('email'), phone: fd.get('phone'), emergencyContact: fd.get('emergencyContact'), moveInDate: fd.get('moveInDate'), creditScore: fd.get('creditScore') ? parseInt(fd.get('creditScore')) : null }; isEdit ? updateTenant(editingTenant.id, data) : addTenant(data); }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input name="firstName" placeholder="First name" defaultValue={isEdit ? editingTenant.firstName : ''} required style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
                <input name="lastName" placeholder="Last name" defaultValue={isEdit ? editingTenant.lastName : ''} required style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
              </div>
              <input name="email" type="email" placeholder="Email" defaultValue={isEdit ? editingTenant.email : ''} required style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
              <input name="phone" placeholder="Phone" defaultValue={isEdit ? editingTenant.phone : ''} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
              <input name="emergencyContact" placeholder="Emergency contact" defaultValue={isEdit ? editingTenant.emergencyContact : ''} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
              <input name="moveInDate" type="date" defaultValue={isEdit ? editingTenant.moveInDate : ''} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
              <input name="creditScore" type="number" placeholder="Credit score" defaultValue={isEdit ? editingTenant.creditScore || '' : ''} min={300} max={850} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button type="button" data-testid="cancel-tenant-modal" onClick={() => { setShowTenantModal(false); setEditingTenant(null); }} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" data-testid="save-tenant-btn" style={{ padding: '8px 16px', background: accentColor, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{isEdit ? 'Save Changes' : 'Add Tenant'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderPaymentModal = () => {
    if (!showPaymentModal) return null;
    return (
      <div data-testid="payment-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: cardBg, borderRadius: 12, padding: 24, width: 480 }}>
          <h3 style={{ color: textColor, marginTop: 0 }}>Record Payment</h3>
          <form data-testid="payment-form" onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); const data = { leaseId: fd.get('leaseId'), tenantId: leases.find(l => l.id === fd.get('leaseId'))?.tenantId || '', amount: parseFloat(fd.get('amount')), date: fd.get('date'), dueDate: fd.get('dueDate'), status: fd.get('status'), method: fd.get('method'), reference: fd.get('reference'), notes: fd.get('notes') }; addPayment(data); }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <select name="leaseId" required style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }}>
                <option value="">Select lease...</option>
                {leases.filter(l => l.status === 'active').map(l => {
                  const tenant = tenants.find(t => t.id === l.tenantId);
                  const unit = units.find(u => u.id === l.unitId);
                  return <option key={l.id} value={l.id}>{tenant?.firstName} {tenant?.lastName} — Unit {unit?.number} (${l.monthlyRent})</option>;
                })}
              </select>
              <input name="amount" type="number" step="0.01" placeholder="Amount" required style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input name="dueDate" type="date" required style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
                <input name="date" type="date" style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <select name="status" style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }}>{PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                <select name="method" style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }}><option value="">Method...</option><option value="bank_transfer">Bank Transfer</option><option value="check">Check</option><option value="wire">Wire</option><option value="cash">Cash</option></select>
              </div>
              <input name="reference" placeholder="Reference #" style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
              <input name="notes" placeholder="Notes" style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button type="button" data-testid="cancel-payment-modal" onClick={() => setShowPaymentModal(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" data-testid="save-payment-btn" style={{ padding: '8px 16px', background: accentColor, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Record Payment</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderMaintenanceModal = () => {
    if (!showMaintenanceModal) return null;
    return (
      <div data-testid="maintenance-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: cardBg, borderRadius: 12, padding: 24, width: 480 }}>
          <h3 style={{ color: textColor, marginTop: 0 }}>New Maintenance Request</h3>
          <form data-testid="maintenance-form" onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); const unitId = fd.get('unitId'); const unit = units.find(u => u.id === unitId); const activeLease = unit ? getUnitLease(unit.id) : null; addMaintenanceRequest({ title: fd.get('title'), description: fd.get('description'), unitId, propertyId: unit?.propertyId || '', tenantId: activeLease?.tenantId || null, priority: fd.get('priority'), status: 'open', assignedTo: fd.get('assignedTo') || null, estimatedCost: fd.get('estimatedCost') ? parseFloat(fd.get('estimatedCost')) : null, actualCost: null, category: fd.get('category') }); }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <input name="title" placeholder="Issue title" required style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
              <textarea name="description" placeholder="Description" rows={3} required style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor, resize: 'vertical' }} />
              <select name="unitId" required style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }}>
                <option value="">Select unit...</option>
                {units.map(u => {
                  const prop = properties.find(p => p.id === u.propertyId);
                  return <option key={u.id} value={u.id}>{prop?.name} — Unit {u.number}</option>;
                })}
              </select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <select name="priority" style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }}>{MAINTENANCE_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select>
                <select name="category" style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }}><option value="plumbing">Plumbing</option><option value="electrical">Electrical</option><option value="hvac">HVAC</option><option value="appliance">Appliance</option><option value="structural">Structural</option><option value="renovation">Renovation</option><option value="other">Other</option></select>
              </div>
              <input name="assignedTo" placeholder="Assigned to (optional)" style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
              <input name="estimatedCost" type="number" step="0.01" placeholder="Estimated cost (optional)" style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button type="button" data-testid="cancel-maintenance-modal" onClick={() => setShowMaintenanceModal(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color: textColor, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" data-testid="save-maintenance-btn" style={{ padding: '8px 16px', background: accentColor, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Submit Request</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const viewMap = {
    dashboard: renderDashboard,
    properties: renderProperties,
    units: renderUnits,
    tenants: renderTenants,
    leases: renderLeases,
    payments: renderPayments,
    maintenance: renderMaintenance,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: bg, color: textColor }}>
      {renderSidebar()}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {renderHeader()}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {viewMap[activeView]?.()}
        </div>
      </div>
      {renderPropertyModal()}
      {renderTenantModal()}
      {renderPaymentModal()}
      {renderMaintenanceModal()}
    </div>
  );
}
