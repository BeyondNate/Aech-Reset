// // frontend/src/pages/PanelAdmin.jsx
// import { useState } from 'react';
// import { supabase } from '../services/supabaseClient';
// import { useState, useEffect } from 'react';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// export default function PanelAdmin() {
//   const [form, setForm] = useState({
//     nombre: '',
//     descripcion: '',
//     presidente: '',
//     vicepresidente: '',
//     secretario: ''
//   });
  
//   const [logoFile, setLogoFile] = useState(null);
//   const [planFile, setPlanFile] = useState(null);
//   const [subiendo, setSubiendo] = useState(false);
//   const [feedback, setFeedback] = useState({ error: null, exito: null });

//   const handleInputChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const ejecutarRegistroLista = async (e) => {
//     e.preventDefault();
//     setSubiendo(true);
//     setFeedback({ error: null, exito: null });

//     try {
//       // 1. Obtener sesión del administrador para firmar las peticiones
//       const { data: { session } } = await supabase.auth.getSession();
//       if (!session) throw new Error('No tienes una sesión administrativa válida.');

//       let logoUrl = '';
//       let planUrl = '';

//       // 2. Subir Logo a Supabase Storage (Bucket: 'logos')
//       if (logoFile) {
//         const fileExt = logoFile.name.split('.').pop();
//         const fileName = `${Date.now()}_logo.${fileExt}`;
        
//         const { error: uploadLogoError } = await supabase.storage
//           .from('logos')
//           .upload(fileName, logoFile);

//         if (uploadLogoError) throw new Error(`Error subiendo logo: ${uploadLogoError.message}`);
        
//         // Obtener la URL pública del archivo cargado
//         const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
//         logoUrl = publicUrlData.publicUrl;
//       }

//       // 3. Subir Plan de Gobierno a Supabase Storage (Bucket: 'planes_gobierno')
//       if (planFile) {
//         const fileExt = planFile.name.split('.').pop();
//         const fileName = `${Date.now()}_plan.${fileExt}`;
        
//         const { error: uploadPlanError } = await supabase.storage
//           .from('planes_gobierno')
//           .upload(fileName, planFile);

//         if (uploadPlanError) throw new Error(`Error subiendo plan: ${uploadPlanError.message}`);
        
//         const { data: publicUrlData } = supabase.storage.from('planes_gobierno').getPublicUrl(fileName);
//         planUrl = publicUrlData.publicUrl;
//       }

//       // 4. Enviar toda la data recolectada a tu servidor Express para persistencia en BD
//       const response = await fetch(`${API_URL}/api/admin/listas`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${session.access_token}`
//         },
//         body: JSON.stringify({
//           nombre: form.nombre,
//           descripcion: form.descripcion,
//           candidatos: {
//             presidente: form.presidente,
//             vicepresidente: form.vicepresidente,
//             secretario: form.secretario
//           },
//           logo_url: logoUrl,
//           plan_gobierno_url: planUrl
//         })
//       });

//       const resultado = await response.json();
//       if (!response.ok) throw new Error(resultado.error || 'No se pudo crear la lista.');

//       setFeedback({ error: null, exito: '¡Lista electoral y archivos registrados correctamente!' });
      
//       // Limpiar formulario
//       setForm({ nombre: '', descripcion: '', presidente: '', vicepresidente: '', secretario: '' });
//       setLogoFile(null);
//       setPlanFile(null);

//     } catch (err) {
//       console.error(err);
//       setFeedback({ error: err.message, exito: null });
//     } finally {
//       setSubiendo(false);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
//       <div className="mb-8 border-b border-gray-200 pb-4">
//         <h1 className="text-3xl font-extrabold text-gray-900">Panel de Control Electoral</h1>
//         <p className="text-gray-500 text-sm">Registro oficial de partidos, listas y planes gubernamentales digitales.</p>
//       </div>

//       {feedback.error && (
//         <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-sm text-red-700">
//           🛑 {feedback.error}
//         </div>
//       )}

//       {feedback.exito && (
//         <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl text-sm text-green-700">
//           🎉 {feedback.exito}
//         </div>
//       )}

//       <form onSubmit={ejecutarRegistroLista} className="space-y-6 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
//         <h2 className="text-xl font-bold text-gray-800">Inscribir Nueva Lista</h2>
        
//         <div className="grid grid-cols-1 gap-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de la Lista / Partido</label>
//             <input type="text" name="nombre" value={form.nombre} onChange={handleInputChange} required className="w-full border p-2 rounded-lg" placeholder="Ej: Frente de Renovación Estudiantil" />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción de Campaña</label>
//             <textarea name="descripcion" value={form.descripcion} onChange={handleInputChange} required className="w-full border p-2 rounded-lg h-24" placeholder="Breve resumen de la visión o enfoque primordial de la lista..." />
//           </div>
//         </div>

//         <h3 className="text-sm font-bold text-gray-400 tracking-wider uppercase pt-2">Plana de Candidatos</h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-xs font-medium text-gray-600 mb-1">Presidente(a)</label>
//             <input type="text" name="presidente" value={form.presidente} onChange={handleInputChange} required className="w-full border p-2 rounded-lg text-sm" />
//           </div>
//           <div>
//             <label className="block text-xs font-medium text-gray-600 mb-1">Vicepresidente(a)</label>
//             <input type="text" name="vicepresidente" value={form.vicepresidente} onChange={handleInputChange} required className="w-full border p-2 rounded-lg text-sm" />
//           </div>
//           <div>
//             <label className="block text-xs font-medium text-gray-600 mb-1">Secretario(a) General</label>
//             <input type="text" name="secretario" value={form.secretario} onChange={handleInputChange} required className="w-full border p-2 rounded-lg text-sm" />
//           </div>
//         </div>

//         <h3 className="text-sm font-bold text-gray-400 tracking-wider uppercase pt-2">Activos Digitales (Supabase Storage)</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="border border-dashed p-4 rounded-xl">
//             <label className="block text-sm font-semibold text-gray-700 mb-2">Logo de la Lista (.png, .jpg)</label>
//             <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
//           </div>

//           <div className="border border-dashed p-4 rounded-xl">
//             <label className="block text-sm font-semibold text-gray-700 mb-2">Plan de Gobierno (Documento PDF)</label>
//             <input type="file" accept=".pdf" onChange={(e) => setPlanFile(e.target.files[0])} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
//           </div>
//         </div>

//         <button type="submit" disabled={subiendo} className="w-full bg-black text-white p-3 rounded-xl font-bold hover:bg-gray-800 transition disabled:bg-gray-400">
//           {subiendo ? 'Procesando subidas y guardando...' : 'Inscribir Lista Oficialmente'}
//         </button>
//       </form>
//     </div>
//   );
// }

// aca
import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const ADMINS = [
  "brad.cardenas@upch.pe",
  "gael.milla@upch.pe"
];

export default function PanelAdmin() {
  const [vista, setVista] = useState("listas");
  const [esAdmin, setEsAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);

  const [denuncias, setDenuncias] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    presidente: "",
    vicepresidente: "",
    secretario: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [planFile, setPlanFile] = useState(null);

  const [subiendo, setSubiendo] = useState(false);
  const [feedback, setFeedback] = useState({
    error: null,
    exito: null,
  });

  useEffect(() => {
    verificarAdministrador();
  }, []);

  useEffect(() => {
    if (vista === "denuncias" && esAdmin) {
      cargarDenuncias();
    }
  }, [vista, esAdmin]);

  async function verificarAdministrador() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setCargando(false);
      return;
    }

    if (ADMINS.includes(session.user.email)) {
      setEsAdmin(true);
    }

    setCargando(false);
  }

  async function cargarDenuncias() {
    const { data, error } = await supabase
      .from("denuncias")
      .select("*")
      .order("fecha", { ascending: false });

    if (!error) {
      setDenuncias(data);
    }
  }

  async function actualizarEstado(id, estado) {
    const { error } = await supabase
      .from("denuncias")
      .update({ estado })
      .eq("id", id);

    if (!error) {
      cargarDenuncias();
    }
  }

  const handleInputChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  async function ejecutarRegistroLista(e) {
    e.preventDefault();

    setSubiendo(true);

    setFeedback({
      error: null,
      exito: null,
    });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session)
        throw new Error("No existe sesión administrativa.");

      let logoUrl = "";
      let planUrl = "";

      if (logoFile) {
        const { data } = await supabase.storage
          .from("logos")
          .upload(`${Date.now()}_logo`, logoFile);

        if (data) {
          logoUrl = supabase.storage
            .from("logos")
            .getPublicUrl(data.path).data.publicUrl;
        }
      }

      if (planFile) {
        const { data } = await supabase.storage
          .from("planes_gobierno")
          .upload(`${Date.now()}_plan`, planFile);

        if (data) {
          planUrl = supabase.storage
            .from("planes_gobierno")
            .getPublicUrl(data.path).data.publicUrl;
        }
      }

      const response = await fetch(`${API_URL}/api/admin/listas`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          candidatos: {
            presidente: form.presidente,
            vicepresidente: form.vicepresidente,
            secretario: form.secretario,
          },
          logo_url: logoUrl,
          plan_gobierno_url: planUrl,
        }),
      });

      if (!response.ok)
        throw new Error("No fue posible registrar la lista.");

      setFeedback({
        error: null,
        exito: "Lista registrada correctamente.",
      });

      setForm({
        nombre: "",
        descripcion: "",
        presidente: "",
        vicepresidente: "",
        secretario: "",
      });
    } catch (err) {
      setFeedback({
        error: err.message,
        exito: null,
      });
    }

    setSubiendo(false);
  }

  if (cargando) return <h2>Cargando...</h2>;

  if (!esAdmin)
    return (
      <div className="max-w-xl mx-auto mt-20 text-center">
        <h2 className="text-2xl font-bold">
          Acceso restringido
        </h2>

        <p className="mt-3">
          Solo los administradores pueden acceder a este panel.
        </p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6">

      <div className="flex gap-6 border-b mb-8 pb-3">

        <button
          onClick={() => setVista("listas")}
          className={vista === "listas" ? "font-bold underline" : ""}
        >
          Inscribir Listas
        </button>

        <button
          onClick={() => setVista("denuncias")}
          className={vista === "denuncias" ? "font-bold underline" : ""}
        >
          Auditoría de Denuncias
        </button>

      </div>

      {vista === "listas" && (

        <form
          onSubmit={ejecutarRegistroLista}
          className="space-y-4"
        >

          <input
            className="border p-2 w-full"
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleInputChange}
          />

          <textarea
            className="border p-2 w-full"
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleInputChange}
          />

          <input
            className="border p-2 w-full"
            name="presidente"
            placeholder="Presidente"
            value={form.presidente}
            onChange={handleInputChange}
          />

          <input
            className="border p-2 w-full"
            name="vicepresidente"
            placeholder="Vicepresidente"
            value={form.vicepresidente}
            onChange={handleInputChange}
          />

          <input
            className="border p-2 w-full"
            name="secretario"
            placeholder="Secretario"
            value={form.secretario}
            onChange={handleInputChange}
          />

          <input
            type="file"
            onChange={(e) => setLogoFile(e.target.files[0])}
          />

          <input
            type="file"
            onChange={(e) => setPlanFile(e.target.files[0])}
          />

          <button
            className="bg-black text-white px-5 py-2 rounded"
            disabled={subiendo}
          >
            {subiendo ? "Guardando..." : "Guardar Lista"}
          </button>

        </form>

      )}

      {vista === "denuncias" && (
        
        <div>
        <p>Total denuncias: {denuncias.length}</p>
          {denuncias.map((d) => (

            <div
              key={d.id}
              className="border rounded-lg p-4 mb-5 shadow-sm"
            >

              <p><b>Descripción:</b> {d.descripcion}</p>

              <p><b>Estado:</b> {d.estado}</p>

              <p><b>Fecha:</b> {new Date(d.fecha).toLocaleString()}</p>

              <p><b>Hash:</b> {d.hash_anonimo}</p>

              {d.evidencia_url && (
                <a
                  href={d.evidencia_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  Ver evidencia
                </a>
              )}

              <div className="mt-4">

                <select
                  value={d.estado}
                  onChange={(e) =>
                    actualizarEstado(d.id, e.target.value)
                  }
                >

                  <option value="pendiente">Pendiente</option>

                  <option value="revision">En revisión</option>

                  <option value="resuelta">Resuelta</option>

                  <option value="rechazada">Rechazada</option>

                </select>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}