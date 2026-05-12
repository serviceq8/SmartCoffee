import { useState, useEffect, useCallback } from 'react';
import { api } from './api';

const R = {
  primary:'#C41230', dark:'#9B0E25', light:'#FDF0F2',
  border:'#E8E8E8', text:'#111827', muted:'#6B7280',
  bg:'#F7F7F7', white:'#FFFFFF',
  success:'#059669', warning:'#D97706',
};

const stCfg = {
  online:      { dot:'#10B981', text:'#065F46', bg:'#ECFDF5', border:'#A7F3D0', label:'Online'      },
  offline:     { dot:'#EF4444', text:'#7F1D1D', bg:'#FEF2F2', border:'#FECACA', label:'Offline'     },
  maintenance: { dot:'#F59E0B', text:'#78350F', bg:'#FFFBEB', border:'#FDE68A', label:'Maintenance' },
  suspended:   { dot:'#6B7280', text:'#374151', bg:'#F9FAFB', border:'#E5E7EB', label:'Suspended'   },
};

const orCfg = {
  all:       { color:R.text,    bg:'#F9FAFB', label:'All'       },
  queued:    { color:'#1D4ED8', bg:'#EFF6FF', label:'Queued'    },
  confirmed: { color:'#7C3AED', bg:'#F5F3FF', label:'Confirmed' },
  brewing:   { color:'#D97706', bg:'#FFFBEB', label:'Brewing'   },
  completed: { color:'#059669', bg:'#ECFDF5', label:'Done'      },
  cancelled: { color:'#6B7280', bg:'#F9FAFB', label:'Cancelled' },
  error:     { color:'#DC2626', bg:'#FEF2F2', label:'Error'     },
};

// ── UI helpers ─────────────────────────────────────────────────
function StockBar({ v }) {
  const c = v>60?'#10B981':v>30?R.warning:R.primary;
  return (
    <div style={{ height:6, background:'#E5E7EB', borderRadius:99, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${v}%`, background:c, borderRadius:99 }} />
    </div>
  );
}
function Badge({ label, color, bg, border }) {
  return <span style={{ background:bg, color, border:`1px solid ${border||bg}`, fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:99, whiteSpace:'nowrap' }}>{label}</span>;
}
function Initials({ name }) {
  const i = (name||'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  return <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg,${R.primary},${R.dark})`, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, flexShrink:0 }}>{i}</div>;
}
function StatusDot({ status }) {
  const cfg = stCfg[status] || stCfg.offline;
  return <div style={{ width:10, height:10, borderRadius:'50%', background:cfg.dot, flexShrink:0, boxShadow:status==='online'?`0 0 0 3px ${cfg.dot}33`:'none' }} />;
}
function Card({ children, style={} }) {
  return <div style={{ background:R.white, border:`1px solid ${R.border}`, borderRadius:20, padding:'22px 24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', ...style }}>{children}</div>;
}
function SearchBox({ value, onChange, placeholder }) {
  return (
    <div style={{ position:'relative', marginBottom:20 }}>
      <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16, color:R.muted }}>🔍</div>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||'Search...'}
        style={{ width:'100%', background:R.white, border:`1.5px solid ${R.border}`, borderRadius:14, padding:'11px 14px 11px 40px', fontSize:14, color:R.text, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
        onFocus={e=>e.target.style.borderColor=R.primary}
        onBlur={e=>e.target.style.borderColor=R.border} />
    </div>
  );
}
function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24 }}>
      <div>
        <h2 style={{ margin:0, fontSize:26, fontWeight:900, color:R.text, letterSpacing:-.5 }}>{title}</h2>
        {sub&&<p style={{ margin:'4px 0 0', fontSize:14, color:R.muted }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
function Spinner() {
  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:60 }}>
      <div style={{ width:36, height:36, borderRadius:'50%', border:`3px solid ${R.border}`, borderTopColor:R.primary, animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
      <div style={{ background:R.white, borderRadius:20, padding:28, width:'100%', maxWidth:480, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <h3 style={{ margin:0, fontSize:20, fontWeight:800, color:R.text }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:R.muted, lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type='text' }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block', fontSize:13, fontWeight:700, color:R.text, marginBottom:6 }}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%', border:`1.5px solid ${R.border}`, borderRadius:12, padding:'10px 14px', fontSize:14, color:R.text, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
        onFocus={e=>e.target.style.borderColor=R.primary}
        onBlur={e=>e.target.style.borderColor=R.border} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block', fontSize:13, fontWeight:700, color:R.text, marginBottom:6 }}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{ width:'100%', border:`1.5px solid ${R.border}`, borderRadius:12, padding:'10px 14px', fontSize:14, color:R.text, outline:'none', fontFamily:'inherit', background:R.white, boxSizing:'border-box' }}>
        <option value="">Select...</option>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── ADD MACHINE MODAL ─────────────────────────────────────────
function AddMachineModal({ onClose, onSuccess, branches }) {
  const [form, setForm] = useState({ id:'', name:'', branch_id:'', type:'Smart', secret_key:'' });
  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState('');

  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  async function submit() {
    if (!form.id||!form.name||!form.secret_key) { setError('ID, Name and Secret Key are required'); return; }
    setLoading(true); setError('');
    try {
      await api.createMachine(form);
      onSuccess();
      onClose();
    } catch(e) {
      setError(e.message || 'Failed to create machine');
    } finally { setLoading(false); }
  }

  return (
    <Modal title="Add New Machine" onClose={onClose}>
      {error&&<div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13, color:'#DC2626' }}>{error}</div>}
      <Input label="Machine ID" value={form.id} onChange={v=>set('id',v)} placeholder="e.g. BYN-025" />
      <Input label="Machine Name" value={form.name} onChange={v=>set('name',v)} placeholder="e.g. Salmiya — Gulf Road" />
      <Select label="Branch" value={form.branch_id} onChange={v=>set('branch_id',v)}
        options={branches.map(b=>({ value:b.id, label:`${b.name} (${b.area})` }))} />
      <Select label="Type" value={form.type} onChange={v=>set('type',v)}
        options={[{ value:'Smart', label:'Smart Machine' },{ value:'Vending', label:'Vending Machine' }]} />
      <Input label="Secret Key" value={form.secret_key} onChange={v=>set('secret_key',v)} placeholder="e.g. secret-key-byn-025" />
      <div style={{ fontSize:12, color:R.muted, marginBottom:20 }}>
        💡 The secret key is burned into the machine firmware. Use a unique strong key per machine.
      </div>
      <button onClick={submit} disabled={loading}
        style={{ width:'100%', background:loading?R.muted:`linear-gradient(135deg,${R.primary},${R.dark})`, color:'#fff', border:'none', borderRadius:14, padding:'13px 0', fontSize:15, fontWeight:800, cursor:loading?'default':'pointer', fontFamily:'inherit' }}>
        {loading ? 'Adding...' : '+ Add Machine'}
      </button>
    </Modal>
  );
}

// ── CONFIRM MODAL ─────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel, confirmColor=R.primary, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  async function go() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }
  return (
    <Modal title={title} onClose={onClose}>
      <p style={{ fontSize:15, color:R.muted, marginBottom:28, lineHeight:1.6 }}>{message}</p>
      <div style={{ display:'flex', gap:12 }}>
        <button onClick={onClose} style={{ flex:1, background:'#F9FAFB', border:`1px solid ${R.border}`, borderRadius:12, padding:'11px 0', fontSize:14, fontWeight:600, color:R.muted, cursor:'pointer', fontFamily:'inherit' }}>
          Cancel
        </button>
        <button onClick={go} disabled={loading}
          style={{ flex:1, background:confirmColor, border:'none', borderRadius:12, padding:'11px 0', fontSize:14, fontWeight:700, color:'#fff', cursor:loading?'default':'pointer', fontFamily:'inherit' }}>
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ── FLEET TAB ─────────────────────────────────────────────────
function FleetTab({ onSelectMachine }) {
  const [machines,  setMachines ] = useState([]);
  const [branches,  setBranches ] = useState([]);
  const [loading,   setLoading  ] = useState(true);
  const [search,    setSearch   ] = useState('');
  const [govFilter, setGovFilter] = useState('All');
  const [showAdd,   setShowAdd  ] = useState(false);
  const [confirm,   setConfirm  ] = useState(null); // { type, machine }

  const load = useCallback(async () => {
    try {
      const [md, bd] = await Promise.all([api.getMachines(), api.getBranches()]);
      setMachines(md.machines || []);
      setBranches(bd.branches || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const t=setInterval(load,30000); return()=>clearInterval(t); }, [load]);

  const govs    = ['All', ...new Set(machines.map(m=>m.area).filter(Boolean))];
  const online  = machines.filter(m=>m.status==='online'&&!m.suspended).length;
  const suspended = machines.filter(m=>m.suspended).length;

  const filtered = machines.filter(m => {
    const govOk  = govFilter==='All'||m.area===govFilter;
    const srchOk = !search||m.name.toLowerCase().includes(search.toLowerCase())||m.id.toLowerCase().includes(search.toLowerCase());
    return govOk && srchOk;
  });

  function getMachineStatus(m) {
    if (m.suspended) return 'suspended';
    return m.status;
  }

  async function handleSuspend(m) {
    await api.suspendMachine(m.id);
    setConfirm(null);
    load();
  }
  async function handleActivate(m) {
    await api.activateMachine(m.id);
    setConfirm(null);
    load();
  }
  async function handleRemove(m) {
    await api.deleteMachine(m.id);
    setConfirm(null);
    load();
  }

  return (
    <div>
      <SectionHeader
        title="Fleet Overview"
        sub="All Boubyan branches across Kuwait"
        action={
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={load} style={{ background:'#F9FAFB', color:R.muted, border:`1px solid ${R.border}`, borderRadius:10, padding:'8px 18px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
              ↻ Refresh
            </button>
            <button onClick={()=>setShowAdd(true)} style={{ background:`linear-gradient(135deg,${R.primary},${R.dark})`, color:'#fff', border:'none', borderRadius:10, padding:'8px 20px', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 12px rgba(196,18,48,0.35)' }}>
              + Add Machine
            </button>
          </div>
        }
      />

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        {[
          { label:'Total Machines', value:machines.length,                                          sub:'Across Kuwait',  icon:'🏦', grad:`linear-gradient(135deg,${R.primary},${R.dark})` },
          { label:'Online Now',     value:online,                                                   sub:'Active & visible',icon:'📡', grad:'linear-gradient(135deg,#059669,#047857)' },
          { label:'Offline',        value:machines.filter(m=>m.status==='offline'&&!m.suspended).length, sub:'Need attention', icon:'⚠️', grad:'linear-gradient(135deg,#DC2626,#B91C1C)' },
          { label:'Suspended',      value:suspended,                                                sub:'Hidden from app', icon:'🔒', grad:'linear-gradient(135deg,#6B7280,#4B5563)' },
        ].map((k,i)=>(
          <Card key={i} style={{ padding:'18px 20px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-16, right:-16, width:70, height:70, borderRadius:'50%', background:k.grad, opacity:.08 }} />
            <div style={{ width:40, height:40, borderRadius:12, background:k.grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, marginBottom:14 }}>{k.icon}</div>
            <div style={{ fontSize:32, fontWeight:900, color:R.text, lineHeight:1, marginBottom:4 }}>{k.value}</div>
            <div style={{ fontSize:14, fontWeight:600, color:R.text, marginBottom:1 }}>{k.label}</div>
            <div style={{ fontSize:12, color:R.muted }}>{k.sub}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        {govs.map(g=>(
          <button key={g} onClick={()=>setGovFilter(g)} style={{ background:govFilter===g?R.primary:'#fff', border:`1.5px solid ${govFilter===g?R.primary:R.border}`, borderRadius:99, padding:'6px 16px', fontSize:13, fontWeight:600, color:govFilter===g?'#fff':R.muted, cursor:'pointer', fontFamily:'inherit', boxShadow:govFilter===g?'0 4px 10px rgba(196,18,48,0.3)':'none' }}>
            {g}
          </button>
        ))}
      </div>

      <SearchBox value={search} onChange={setSearch} placeholder="Search by branch name or machine ID..." />

      {loading ? <Spinner /> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
          {filtered.map(m=>{
            const mStatus = getMachineStatus(m);
            const st = stCfg[mStatus] || stCfg.offline;
            return (
              <div key={m.id} style={{ background:R.white, border:`1px solid ${m.suspended?'#E5E7EB':R.border}`, borderRadius:18, padding:'18px 20px', opacity:m.suspended?0.7:1, transition:'all .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}
                onMouseEnter={e=>{ if(!m.suspended){ e.currentTarget.style.boxShadow='0 8px 24px rgba(196,18,48,0.12)'; e.currentTarget.style.borderColor=R.primary; e.currentTarget.style.transform='translateY(-2px)'; }}}
                onMouseLeave={e=>{ e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor=m.suspended?'#E5E7EB':R.border; e.currentTarget.style.transform='none'; }}>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                  <div style={{ flex:1, minWidth:0 }} onClick={()=>!m.suspended&&onSelectMachine(m)} style={{ cursor:m.suspended?'default':'pointer', flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:3 }}>
                      <StatusDot status={mStatus} />
                      <span style={{ fontSize:15, fontWeight:800, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name}</span>
                    </div>
                    <div style={{ fontSize:12, color:R.muted, paddingLeft:19 }}>
                      {m.area} · {m.type} · {m.id}
                      {m.suspended && <span style={{ marginLeft:6, color:'#6B7280', fontWeight:700 }}>· Hidden from Msa3ed</span>}
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:10, flexShrink:0 }}>
                    <Badge label={st.label} color={st.text} bg={st.bg} border={st.border} />
                  </div>
                </div>

                {!m.suspended && m.status!=='offline' && (
                  <>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:12 }}>
                      {[{l:'Beans',v:m.beans_level},{l:'Milk',v:m.milk_level},{l:'Cups',v:m.cups_level}].map(s=>(
                        <div key={s.l}>
                          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:R.muted, marginBottom:5 }}>
                            <span>{s.l}</span>
                            <span style={{ fontWeight:800, color:s.v>60?'#059669':s.v>30?R.warning:R.primary }}>{s.v}%</span>
                          </div>
                          <StockBar v={s.v} />
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize:12, color:R.muted, paddingTop:10, borderTop:`1px solid ${R.border}` }}>
                      Last heartbeat: {m.last_heartbeat ? new Date(m.last_heartbeat).toLocaleTimeString() : 'Never'}
                    </div>
                  </>
                )}

                {/* Action buttons */}
                <div style={{ display:'flex', gap:8, marginTop:12, paddingTop:12, borderTop:`1px solid ${R.border}` }}>
                  {m.suspended ? (
                    <button onClick={()=>setConfirm({type:'activate',machine:m})}
                      style={{ flex:1, background:'#ECFDF5', border:'1px solid #A7F3D0', borderRadius:10, padding:'7px 0', fontSize:12, fontWeight:700, color:'#065F46', cursor:'pointer', fontFamily:'inherit' }}>
                      ✅ Activate
                    </button>
                  ) : (
                    <button onClick={()=>setConfirm({type:'suspend',machine:m})}
                      style={{ flex:1, background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:10, padding:'7px 0', fontSize:12, fontWeight:700, color:'#78350F', cursor:'pointer', fontFamily:'inherit' }}>
                      ⏸ Suspend
                    </button>
                  )}
                  <button onClick={()=>setConfirm({type:'remove',machine:m})}
                    style={{ flex:1, background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'7px 0', fontSize:12, fontWeight:700, color:'#7F1D1D', cursor:'pointer', fontFamily:'inherit' }}>
                    🗑 Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Machine Modal */}
      {showAdd && (
        <AddMachineModal
          onClose={()=>setShowAdd(false)}
          onSuccess={load}
          branches={branches}
        />
      )}

      {/* Confirm Modals */}
      {confirm?.type==='suspend' && (
        <ConfirmModal
          title="Suspend Machine"
          message={`Suspending ${confirm.machine.name} will hide it from the Msa3ed app. Customers will no longer see it. You can reactivate it at any time.`}
          confirmLabel="Suspend Machine"
          confirmColor="#D97706"
          onClose={()=>setConfirm(null)}
          onConfirm={()=>handleSuspend(confirm.machine)}
        />
      )}
      {confirm?.type==='activate' && (
        <ConfirmModal
          title="Activate Machine"
          message={`Activating ${confirm.machine.name} will make it visible again in the Msa3ed app once it comes online.`}
          confirmLabel="Activate Machine"
          confirmColor="#059669"
          onClose={()=>setConfirm(null)}
          onConfirm={()=>handleActivate(confirm.machine)}
        />
      )}
      {confirm?.type==='remove' && (
        <ConfirmModal
          title="Remove Machine"
          message={`Are you sure you want to permanently remove ${confirm.machine.name} from the system? This will delete all its data including drinks, suppliers and content. This cannot be undone.`}
          confirmLabel="Yes, Remove Permanently"
          confirmColor={R.primary}
          onClose={()=>setConfirm(null)}
          onConfirm={()=>handleRemove(confirm.machine)}
        />
      )}
    </div>
  );
}

// ── ORDERS TAB ────────────────────────────────────────────────
function OrdersTab() {
  const [orders,   setOrders  ] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading,  setLoading ] = useState(true);
  const [filter,   setFilter  ] = useState('all');

  const load = useCallback(async () => {
    try {
      const [od, md] = await Promise.all([api.getOrders(), api.getMachines()]);
      setOrders(od.orders   || []);
      setMachines(md.machines || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const t=setInterval(load,15000); return()=>clearInterval(t); }, [load]);

  const getMachineName = id => machines.find(m=>m.id===id)?.name?.split('—')[0]?.trim()||id;
  const filtered = orders.filter(o=>filter==='all'||o.status===filter);

  return (
    <div style={{ maxWidth:900 }}>
      <SectionHeader title="Order Queue" sub="Live orders across all branches"
        action={<button onClick={load} style={{ background:`linear-gradient(135deg,${R.primary},${R.dark})`, color:'#fff', border:'none', borderRadius:10, padding:'8px 18px', fontSize:13, fontWeight:700, cursor:'pointer' }}>↻ Refresh</button>} />
      <div style={{ display:'flex', gap:8, marginBottom:22, flexWrap:'wrap' }}>
        {Object.entries(orCfg).map(([k,v])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{ background:filter===k?v.color:'#fff', border:`1.5px solid ${filter===k?v.color:R.border}`, borderRadius:99, padding:'6px 16px', fontSize:13, fontWeight:700, color:filter===k?'#fff':R.muted, cursor:'pointer', fontFamily:'inherit' }}>
            {v.label}
          </button>
        ))}
      </div>
      {loading ? <Spinner /> : (
        <Card style={{ padding:0, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 120px 180px 120px 90px', padding:'12px 24px', background:'#FAFAFA', borderBottom:`1px solid ${R.border}` }}>
            {['Customer','Drink','Branch','Status','Code'].map(h=>(
              <div key={h} style={{ fontSize:11, fontWeight:800, color:R.muted, letterSpacing:.8, textTransform:'uppercase' }}>{h}</div>
            ))}
          </div>
          {filtered.length===0&&<div style={{ padding:48, textAlign:'center', color:R.muted, fontSize:14 }}>No orders</div>}
          {filtered.map((o,i)=>{
            const os=orCfg[o.status]||orCfg.all;
            return (
              <div key={o.id} style={{ display:'grid', gridTemplateColumns:'1fr 120px 180px 120px 90px', padding:'16px 24px', borderBottom:i<filtered.length-1?`1px solid ${R.border}`:'none', alignItems:'center', background:i%2===0?R.white:'#FAFAFA' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <Initials name={o.customer_name||'?'} />
                  <div>
                    <div style={{ fontSize:14, fontWeight:700 }}>{o.customer_name}</div>
                    <div style={{ fontSize:12, color:R.muted }}>{new Date(o.created_at).toLocaleTimeString()}</div>
                  </div>
                </div>
                <div style={{ fontSize:13 }}>{o.drink_name}</div>
                <div style={{ fontSize:12, color:R.muted }}>{getMachineName(o.machine_id)}</div>
                <Badge label={os.label} color={os.color} bg={os.bg} />
                <div style={{ background:'#F5F5F5', border:`2px solid ${R.border}`, borderRadius:10, padding:'5px 0', textAlign:'center', fontSize:16, fontWeight:900, color:R.primary, letterSpacing:4 }}>{o.code}</div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

// ── MACHINE DETAIL TAB ────────────────────────────────────────
function MachineTab({ selected }) {
  const [machines,  setMachines ] = useState([]);
  const [sel,       setSel      ] = useState(selected);
  const [detail,    setDetail   ] = useState(null);
  const [menu,      setMenu     ] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search,    setSearch   ] = useState('');
  const [loading,   setLoading  ] = useState(false);

  useEffect(() => { api.getMachines().then(d=>setMachines(d.machines||[])); }, []);

  useEffect(() => {
    if (!sel) return;
    setLoading(true);
    Promise.all([api.getMachine(sel.id), api.getMenu(sel.id), api.getSuppliers(sel.id)])
      .then(([md,mn,sp])=>{ setDetail(md.machine); setMenu(mn.menu||[]); setSuppliers(sp.suppliers||[]); })
      .catch(console.error)
      .finally(()=>setLoading(false));
  }, [sel]);

  const filtered = machines.filter(m=>!search||m.name.toLowerCase().includes(search.toLowerCase())||m.id.toLowerCase().includes(search.toLowerCase()));

  const mStatus = sel ? (sel.suspended?'suspended':sel.status) : null;
  const st = mStatus ? (stCfg[mStatus]||stCfg.offline) : null;

  return (
    <div>
      <SectionHeader title="Machine Detail" sub="Select a machine to inspect" />
      <SearchBox value={search} onChange={setSearch} placeholder="Search machines..." />
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {filtered.slice(0,16).map(m=>{
          const a=sel?.id===m.id;
          const ms=m.suspended?'suspended':m.status;
          return (
            <button key={m.id} onClick={()=>setSel(m)} style={{ background:a?R.primary:'#fff', border:`1.5px solid ${a?R.primary:R.border}`, borderRadius:10, padding:'6px 13px', fontSize:12, fontWeight:700, color:a?'#fff':R.muted, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6, boxShadow:a?'0 4px 10px rgba(196,18,48,0.3)':'none' }}>
              <StatusDot status={ms} />
              {m.id.replace('BYN-','')} {m.name.split('—')[0].split(' ')[0]}
            </button>
          );
        })}
      </div>

      {!sel&&<div style={{ textAlign:'center', padding:60, color:R.muted, fontSize:15 }}>Select a machine above</div>}
      {sel&&loading&&<Spinner />}
      {sel&&!loading&&detail&&(
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <Card>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                <div>
                  <div style={{ fontSize:20, fontWeight:900, marginBottom:4 }}>{detail.name}</div>
                  <div style={{ fontSize:13, color:R.muted }}>{detail.area} · {detail.id} · {detail.type}</div>
                  {detail.suspended&&<div style={{ marginTop:6, fontSize:12, color:'#6B7280', fontWeight:700 }}>🔒 Hidden from Msa3ed app</div>}
                </div>
                {st&&<Badge label={st.label} color={st.text} bg={st.bg} border={st.border} />}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[{l:'Machine ID',v:detail.id},{l:'Type',v:detail.type},{l:'Area',v:detail.area},{l:'Branch',v:detail.branch_name?.split('—')[0]?.trim()||'—'}].map(f=>(
                  <div key={f.l} style={{ background:'#F9FAFB', borderRadius:12, padding:'12px 16px' }}>
                    <div style={{ fontSize:10, color:R.muted, fontWeight:700, letterSpacing:.8, marginBottom:5, textTransform:'uppercase' }}>{f.l}</div>
                    <div style={{ fontSize:16, fontWeight:800, color:R.primary }}>{f.v}</div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <div style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>Stock Levels</div>
              {[{l:'Coffee Beans',s:'Air Roastery',v:detail.beans_level},{l:'Fresh Milk',s:'KDCOW',v:detail.milk_level},{l:'Cups',s:'—',v:detail.cups_level}].map(s=>(
                <div key={s.l} style={{ marginBottom:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
                    <span style={{ fontSize:14, fontWeight:600 }}>{s.l} <span style={{ fontSize:12, color:R.muted, fontWeight:400 }}>· {s.s}</span></span>
                    <span style={{ fontSize:15, fontWeight:900, color:s.v>60?'#059669':s.v>30?R.warning:R.primary }}>{s.v}%</span>
                  </div>
                  <StockBar v={s.v} />
                </div>
              ))}
            </Card>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <Card>
              <div style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>Suppliers</div>
              {suppliers.map(s=>(
                <div key={s.id} style={{ display:'flex', alignItems:'center', gap:14, background:'#F9FAFB', borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
                  <div style={{ width:52, height:52, borderRadius:12, background:'#fff', border:`1px solid ${R.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
                    {s.role==='beans'?'🫘':'🥛'}
                  </div>
                  <div>
                    <div style={{ fontSize:16, fontWeight:800 }}>{s.name}</div>
                    <div style={{ fontSize:12, color:R.muted, marginTop:2 }}>{s.role==='beans'?'Coffee Beans':'Fresh Milk'}</div>
                  </div>
                </div>
              ))}
            </Card>
            <Card>
              <div style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>Drink Menu</div>
              {menu.map(d=>(
                <div key={d.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:`1px solid ${R.border}` }}>
                  <span style={{ fontSize:22 }}>{d.icon}</span>
                  <span style={{ fontSize:14, fontWeight:600 }}>{d.name}</span>
                  <span style={{ marginLeft:'auto', fontSize:12, color:'#059669', fontWeight:700 }}>Available</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function App() {
  const [tab,     setTab    ] = useState('fleet');
  const [selMach, setSelMach] = useState(null);

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:R.bg, minHeight:'100vh', color:R.text }}>
      <div style={{ background:R.white, borderBottom:`1px solid ${R.border}`, padding:'0 32px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 1px 0 rgba(0,0,0,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:42, height:42, borderRadius:12, background:`linear-gradient(135deg,${R.primary},${R.dark})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(196,18,48,0.4)' }}>
            <span style={{ color:'#fff', fontWeight:900, fontSize:18 }}>B</span>
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:800, letterSpacing:-.3 }}>Boubyan Bank</div>
            <div style={{ fontSize:11, color:R.muted }}>Coffee Machine Platform</div>
          </div>
        </div>
        <a href="https://smart-coffee-api.onrender.com/health" target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
          <div style={{ background:'#ECFDF5', color:'#065F46', fontSize:12, fontWeight:700, padding:'6px 14px', borderRadius:99, border:'1px solid #A7F3D0', display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#10B981' }} />
            API Live
          </div>
        </a>
      </div>
      <div style={{ background:R.white, borderBottom:`1px solid ${R.border}`, padding:'0 32px', display:'flex' }}>
        {[{id:'fleet',icon:'◉',label:'Fleet Overview'},{id:'orders',icon:'≡',label:'Order Queue'},{id:'machine',icon:'⊞',label:'Machine Detail'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ background:'none', border:'none', borderBottom:tab===t.id?`3px solid ${R.primary}`:'3px solid transparent', color:tab===t.id?R.primary:R.muted, fontSize:14, fontWeight:tab===t.id?700:500, padding:'15px 20px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8 }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
      <div style={{ padding:'28px 32px' }}>
        {tab==='fleet'  &&<FleetTab   onSelectMachine={m=>{setSelMach(m);setTab('machine');}} />}
        {tab==='orders' &&<OrdersTab  />}
        {tab==='machine'&&<MachineTab selected={selMach} />}
      </div>
    </div>
  );
}
