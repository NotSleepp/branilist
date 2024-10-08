'use client'

import { useState, useEffect } from 'react'
import { Check, X, Plus, Trash2, Edit2, Save, Filter, Moon, Sun, Flower2, LogIn, LogOut, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from '@supabase/supabase-js'
import { User as SupabaseUser } from '@supabase/supabase-js'

// Inicializa el cliente de Supabase
const supabase = createClient('https://npyikbcjzfvynuxjagkp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weWlrYmNqemZ2eW51eGphZ2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0MDAxMzQsImV4cCI6MjA0Mzk3NjEzNH0.UxY8kpy6ZjgaEVjuM0HaNPFHSE5W1MWkBgKWMM7qGrY')

type Item = {
  id: string
  nombre_articulo: string
  categoria: string
  icono: string
  usuario_id: number
  privado: boolean
  comprado: boolean
}

type CustomUser = {
  id: number
  email: string | null
}

type Category = {
  id: number;
  nombre: string;
}

const defaultCategories: string[] = [
  "Comidas",
  "Casa",
  "Ropa",
  "Libros",
  "Regalos",
  "Otros"
]

const iconOptions = [
  { value: '❀', label: 'Flor de cerezo' },
  { value: '✿', label: 'Flor' },
  { value: '❁', label: 'Flor con centro' },
  { value: '✾', label: 'Flor de ocho pétalos' },
  { value: '✽', label: 'Asterisco floral' },
  { value: '❃', label: 'Flor con puntos' },
  { value: '❋', label: 'Flor de seis pétalos' },
  { value: '🍂', label: 'Hoja otoñal' },
  { value: '🍁', label: 'Hoja de arce' },
  { value: '🌿', label: 'Rama con hojas' },
]

export default function ListaComprasOtgwMejorada() {
  const [items, setItems] = useState<Item[]>([])
  const [newItem, setNewItem] = useState('')
  const [newCategory, setNewCategory] = useState(defaultCategories[0])
  const [newIcon, setNewIcon] = useState('')
  const [categories, setCategories] = useState(defaultCategories)
  const [editingCategory, setEditingCategory] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('dateAdded')
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState<CustomUser | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  useEffect(() => {
    checkUser()
    const savedDarkMode = localStorage.getItem('otgwShoppingListDarkModeImproved')
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode))
  }, [])

  useEffect(() => {
    if (user) {
      fetchItems()
      fetchCategories()
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem('otgwShoppingListDarkModeImproved', JSON.stringify(darkMode))
  }, [darkMode])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Intentar obtener el ID numérico del usuario desde la tabla 'usuarios'
      let { data, error } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', user.email)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Si no se encuentra el usuario, lo creamos
          const { data: newUser, error: insertError } = await supabase
            .from('usuarios')
            .insert({ nombre: user.email, email: user.email })
            .select('id')
            .single()
          
          if (insertError) {
            console.log('Error al crear el usuario en la base de datos:', insertError)
            setUser(null)
            return
          }
          data = newUser
        } else {
          console.log('Error al obtener el ID del usuario:', error)
          setUser(null)
          return
        }
      }
      
      if (data && data.id) {
        setUser({ id: data.id, email: user.email ?? null })
      } else {
        console.log('No se pudo obtener el ID del usuario')
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }

  async function signUp() {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })
    if (authError) {
      console.log('error', authError)
    } else if (authData.user) {
      // Crear un nuevo registro en la tabla 'usuarios'
      const { data, error } = await supabase
        .from('usuarios')
        .insert({ nombre: authData.user.email ?? email, email: authData.user.email ?? email })
        .select()
      
      if (error) {
        console.log('Error al crear el usuario en la base de datos:', error)
      } else {
        setUser({ id: data[0].id, email: authData.user.email ?? null })
      }
    }
  }

  async function signIn() {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (authError) {
      console.log('error', authError)
    } else if (authData.user) {
      // Obtener el ID numérico del usuario desde la tabla 'usuarios'
      const { data, error } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', authData.user.email)
        .single()
      
      if (error) {
        console.log('Error al obtener el ID del usuario:', error)
      } else {
        setUser({ id: data.id, email: authData.user.email ?? null })
      }
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) console.log('error', error)
    else setUser(null)
  }

  async function fetchItems() {
    if (user) {
      const { data, error } = await supabase
        .from('lista_compras')
        .select(`
          *,
          categorias (nombre)
        `)
        .or(`privado.eq.false,usuario_id.eq.${user.id}`)

      if (error) {
        console.log('error', error)
      } else {
        setItems(data.map(item => ({
          ...item,
          categoria: item.categorias?.nombre || 'Sin categoría'
        })))
      }
    }
  }

  async function addItem() {
    if (newItem && user) {
      try {
        const { data: categoryData, error: categoryError } = await supabase
          .from('categorias')
          .select('id')
          .eq('nombre', newCategory)
          .single()

        if (categoryError) throw categoryError

        const { data, error } = await supabase
          .from('lista_compras')
          .insert([
            { 
              nombre_articulo: newItem, 
              categoria_id: categoryData.id,
              icono: newIcon || iconOptions[Math.floor(Math.random() * iconOptions.length)].value,
              usuario_id: user.id,
              privado: isPrivate,
              comprado: false
            }
          ])
          .select(`*, categorias (nombre)`)
          .single()

        if (error) throw error

        setItems([...items, { ...data, categoria: data.categorias.nombre, comprado: false }])
        setNewItem('')
        setNewIcon('')
        setIsPrivate(false)
      } catch (error) {
        console.log('Error al añadir el artículo:', error)
      }
    }
  }

  async function removeItem(id: string) {
    const { error } = await supabase
      .from('lista_compras')
      .delete()
      .eq('id', id)
    if (error) console.log('error', error)
    else setItems(items.filter(item => item.id !== id))
  }

  async function editItem(id: string, newText: string, newCategory: string, newIcon: string, newPrivate: boolean, newComprado: boolean) {
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categorias')
        .select('id')
        .eq('nombre', newCategory)
        .single()

      if (categoryError) throw categoryError

      const { data, error } = await supabase
        .from('lista_compras')
        .update({ 
          nombre_articulo: newText, 
          categoria_id: categoryData.id, 
          icono: newIcon, 
          privado: newPrivate,
          comprado: newComprado
        })
        .eq('id', id)
        .select(`*, categorias (nombre)`)
        .single()

      if (error) throw error

      setItems(items.map(item =>
        item.id === id ? { ...data, categoria: data.categorias.nombre } : item
      ))
    } catch (error) {
      console.log('Error al editar el artículo:', error)
    }
  }

  async function addCategory(category: string) {
    if (category && !categories.includes(category)) {
      try {
        const { data, error } = await supabase
          .from('categorias')
          .insert({ nombre: category })
          .select()

        if (error) throw error

        setCategories([...categories, category])
        setEditingCategory('')
      } catch (error) {
        console.log('Error al añadir la categoría a la base de datos:', error)
      }
    }
  }

  const removeCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category))
    setItems(items.map(item => 
      item.categoria === category ? { ...item, categoria: 'Otros' } : item
    ))
  }

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true
    return item.categoria === filter
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sort === 'alphabetical') return a.nombre_articulo.localeCompare(b.nombre_articulo)
    return 0
  })

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre')

    if (error) {
      console.log('Error al obtener las categorías:', error)
    } else {
      const existingCategories = data ? data.map(cat => cat.nombre) : []
      const categoriesToAdd = defaultCategories.filter(cat => !existingCategories.includes(cat))

      if (categoriesToAdd.length > 0) {
        const { error: insertError } = await supabase
          .from('categorias')
          .insert(categoriesToAdd.map(cat => ({ nombre: cat })))

        if (insertError) {
          console.log('Error al añadir categorías por defecto:', insertError)
        }
      }

      // Usar Array.from() en lugar del operador spread
      const allCategories = Array.from(new Set(existingCategories.concat(defaultCategories)))
      setCategories(allCategories)
    }
  }

  async function toggleComprado(id: string, comprado: boolean) {
    try {
      const { data, error } = await supabase
        .from('lista_compras')
        .update({ comprado: !comprado })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setItems(items.map(item =>
        item.id === id ? { ...item, comprado: !comprado } : item
      ))
    } catch (error) {
      console.log('Error al actualizar el estado de compra del artículo:', error)
    }
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-[#2C2C2C] text-[#F0E6D2]' : 'bg-[#F0E6D2] text-[#4A4A4A]'}`}>
        <div className={`w-full max-w-md p-8 rounded-lg shadow-lg ${darkMode ? 'bg-[#3A3A3A] border-[#5C5C5C]' : 'bg-[#FFF8E7] border-[#D2B48C]'}`}>
          <h2 className="text-2xl font-bold mb-6 text-center">Iniciar sesión / Registrarse</h2>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-6"
          />
          <div className="flex justify-between">
            <Button onClick={signIn} className={`${darkMode ? 'bg-[#8B4513] hover:bg-[#A0522D] text-[#F0E6D2]' : 'bg-[#D2B48C] hover:bg-[#CD853F] text-[#4A4A4A]'}`}>
              <LogIn className="mr-2 h-4 w-4" /> Iniciar sesión
            </Button>
            <Button onClick={signUp} className={`${darkMode ? 'bg-[#8B4513] hover:bg-[#A0522D] text-[#F0E6D2]' : 'bg-[#D2B48C] hover:bg-[#CD853F] text-[#4A4A4A]'}`}>
              <User className="mr-2 h-4 w-4" /> Registrarse
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={`min-h-screen p-4 md:p-8 font-serif transition-colors duration-300 ${darkMode ? 'bg-[#2C2C2C] text-[#F0E6D2]' : 'bg-[#F0E6D2] text-[#4A4A4A]'}`}>
        <div className={`max-w-4xl mx-auto rounded-lg shadow-lg p-6 md:p-8 border-4 transition-colors duration-300 relative overflow-hidden ${darkMode ? 'bg-[#3A3A3A] border-[#5C5C5C]' : 'bg-[#FFF8E7] border-[#D2B48C]'}`}>
          {/* Flores decorativas */}
          <div className="absolute top-0 left-0 w-24 h-24 opacity-20 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-pink-300">
              <path d="M30,50 Q50,20 70,50 Q90,80 50,95 Q10,80 30,50 Z" />
              <circle cx="50" cy="50" r="8" />
            </svg>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 opacity-20 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-purple-300">
              <path d="M20,50 Q50,20 80,50 Q50,80 20,50 Z" />
              <circle cx="50" cy="50" r="8" />
            </svg>
          </div>
          <div className="absolute bottom-0 left-0 w-16 h-16 opacity-20 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-yellow-300">
              <path d="M50,20 Q80,50 50,80 Q20,50 50,20 Z" />
              <circle cx="50" cy="50" r="8" />
            </svg>
          </div>
          <div className="absolute bottom-0 right-0 w-28 h-28 opacity-20 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-green-300">
              <path d="M30,30 Q50,10 70,30 Q90,50 70,70 Q50,90 30,70 Q10,50 30,30 Z" />
              <circle cx="50" cy="50" r="8" />
            </svg>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-8"
          >
            <h1 className="text-4xl font-bold text-center text-[#8B4513]">Lista de Compras &lt;3♡</h1>
            <div className="flex items-center space-x-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{darkMode ? 'Modo día' : 'Modo noche'}</p>
                </TooltipContent>
              </Tooltip>
              <Button onClick={signOut} className={`${darkMode ? 'bg-[#8B4513] hover:bg-[#A0522D] text-[#F0E6D2]' : 'bg-[#D2B48C] hover:bg-[#CD853F] text-[#4A4A4A]'}`}>
                <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`mb-8 p-6 rounded-lg shadow-md border ${darkMode ? 'bg-[#4A4A4A] border-[#5C5C5C]' : 'bg-[#FFFFFF] border-[#D2B48C]'}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1">
                <Label htmlFor="new-item" className={`text-lg font-semibold mb-2 block ${darkMode ? 'text-[#F0E6D2]' : 'text-[#8B4513]'}`}>
                  Nombre
                </Label>
                <Input
                  id="new-item"
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem()}
                  className={`border-2 focus:ring-2 text-lg py-3 ${
                    darkMode
                      ? 'bg-[#3A3A3A] border-[#5C5C5C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#F0E6D2]'
                      : 'bg-[#FFF8E7] border-[#D2B48C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#4A4A4A]'
                  }`}
                  placeholder="Nombre"
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="category" className={`text-lg font-semibold mb-2 block ${darkMode ? 'text-[#F0E6D2]' : 'text-[#8B4513]'}`}>
                  Categoría
                </Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger id="category" className={`border-2 focus:ring-2 text-lg py-3 ${
                    darkMode
                      ? 'bg-[#3A3A3A] border-[#5C5C5C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#F0E6D2]'
                      : 'bg-[#FFF8E7] border-[#D2B48C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#4A4A4A]'
                  }`}>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Label htmlFor="icon" className={`text-lg font-semibold mb-2 block ${darkMode ? 'text-[#F0E6D2]' : 'text-[#8B4513]'}`}>Icono</Label>
                <Select value={newIcon} onValueChange={setNewIcon}>
                  <SelectTrigger id="icon" className={`border-2 focus:ring-2 text-lg py-3 ${darkMode ? 'bg-[#3A3A3A] border-[#5C5C5C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#F0E6D2]' : 'bg-[#FFF8E7] border-[#D2B48C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#4A4A4A]'}`}>
                    <SelectValue placeholder="Eligí un icono" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.value} {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center mt-4">
              <Checkbox
                id="private"
                checked={isPrivate}
                onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
              />
              <Label
                htmlFor="private"
                className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Privado
              </Label>
            </div>
            <Button onClick={addItem} className={`w-full mt-4 text-lg py-6 ${darkMode ? 'bg-[#8B4513] hover:bg-[#A0522D] text-[#F0E6D2]' : 'bg-[#D2B48C] hover:bg-[#CD853F] text-[#4A4A4A]'}`}>
              <Plus className="mr-2 h-5 w-5" /> Agregar
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
          >
            <div className="flex items-center space-x-2">
              <Label htmlFor="filter" className={`text-lg font-semibold ${darkMode ? 'text-[#F0E6D2]' : 'text-[#8B4513]'}`}>Filtrar:</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger id="filter" className={`w-[180px] border-2 focus:ring-2 ${darkMode ? 'bg-[#3A3A3A] border-[#5C5C5C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#F0E6D2]' : 'bg-[#FFF8E7] border-[#D2B48C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#4A4A4A]'}`}>
                  <SelectValue placeholder="Filtrar por" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">Todos</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="sort" className={`text-lg font-semibold ${darkMode ? 'text-[#F0E6D2]' : 'text-[#8B4513]'}`}>Ordenar:</Label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger id="sort" className={`w-[180px] border-2 focus:ring-2  ${darkMode ? 'bg-[#3A3A3A] border-[#5C5C5C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#F0E6D2]' : 'bg-[#FFF8E7] border-[#D2B48C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#4A4A4A]'}`}>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="dateAdded">Fecha</SelectItem>
                  <SelectItem value="alphabetical">Alfabético</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          <AnimatePresence>
            {sortedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`mb-4 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow ${darkMode ? 'bg-[#4A4A4A] border border-[#5C5C5C]' : 'bg-[#FFFFFF] border border-[#D2B48C]'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-grow flex items-center space-x-2 overflow-hidden">
                    <span className={`text-2xl ${darkMode ? 'text-[#F0E6D2]' : 'text-[#8B4513]'}`}>{item.icono}</span>
                    <span className={`text-lg truncate ${item.comprado ? 'line-through' : ''} ${darkMode ? 'text-[#F0E6D2]' : 'text-[#4A4A4A]'}`}>
                      {item.nombre_articulo}
                    </span>
                    {item.privado && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">Privado</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Este artículo es privado y solo visible para ti</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <span className={`text-sm ${darkMode ? 'text-[#D2B48C]' : 'text-[#8B4513]'}`}>{item.categoria}</span>
                  {user && Number(item.usuario_id) === user.id && (
                    <>
                      <Checkbox
                        checked={item.comprado}
                        onCheckedChange={() => toggleComprado(item.id, item.comprado)}
                      />
                      <Dialog>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon" className={`${darkMode ? 'text-[#F0E6D2] hover:text-[#FFFFFF] border-[#5C5C5C]' : 'text-[#8B4513] hover:text-[#A0522D] border-[#D2B48C]'}`}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar artículo</p>
                          </TooltipContent>
                        </Tooltip>
                        <DialogContent className={`z-50 ${darkMode ? 'bg-[#3A3A3A] text-[#F0E6D2]' : 'bg-[#FFF8E7] text-[#4A4A4A]'}`}>
                          <DialogHeader>
                            <DialogTitle>Editar Artículo</DialogTitle>
                            <DialogDescription>
                              Modifique los detalles del artículo según sea necesario.
                            </DialogDescription>
                          </DialogHeader>
                          <Input
                            defaultValue={item.nombre_articulo}
                            onChange={(e) => setEditingCategory(e.target.value)}
                            className={`border-2 focus:ring-2 ${darkMode ? 'bg-[#4A4A4A] border-[#5C5C5C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#F0E6D2]' : 'bg-[#FFFFFF] border-[#D2B48C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#4A4A4A]'}`}
                          />
                          <Select defaultValue={item.categoria} onValueChange={(value) => editItem(item.id, editingCategory || item.nombre_articulo, value, item.icono, item.privado, item.comprado)}>
                            <SelectTrigger className={`border-2 focus:ring-2 ${darkMode ? 'bg-[#4A4A4A] border-[#5C5C5C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#F0E6D2]' : 'bg-[#FFFFFF] border-[#D2B48C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#4A4A4A]'}`}>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent className="z-50">
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select defaultValue={item.icono} onValueChange={(value) => editItem(item.id, editingCategory || item.nombre_articulo, item.categoria, value, item.privado, item.comprado)}>
                            <SelectTrigger className={`border-2 focus:ring-2 ${darkMode ? 'bg-[#4A4A4A] border-[#5C5C5C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#F0E6D2]' : 'bg-[#FFFFFF] border-[#D2B48C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#4A4A4A]'}`}>
                              <SelectValue placeholder="Elige un icono" />
                            </SelectTrigger>
                            <SelectContent className="z-50">
                              {iconOptions.map((icon) => (
                                <SelectItem key={icon.value} value={icon.value}>
                                  {icon.value} {icon.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex items-center">
                            <Checkbox
                              id="edit-private"
                              checked={item.privado}
                              onCheckedChange={(checked) => editItem(item.id, editingCategory || item.nombre_articulo, item.categoria, item.icono, checked as boolean, item.comprado)}
                            />
                            <Label
                              htmlFor="edit-private"
                              className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Privado
                            </Label>
                          </div>
                          <Button onClick={() => editItem(item.id, editingCategory || item.nombre_articulo, item.categoria, item.icono, item.privado, item.comprado)} className={`${darkMode ? 'bg-[#8B4513] hover:bg-[#A0522D] text-[#F0E6D2]' : 'bg-[#D2B48C] hover:bg-[#CD853F] text-[#4A4A4A]'}`}>
                            <Save className="mr-2 h-4 w-4" /> Guardar
                          </Button>
                        </DialogContent>
                      </Dialog>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => removeItem(item.id)}
                            variant="outline"
                            size="icon"
                            className={`text-red-500 hover:text-red-700 ${darkMode ? 'border-[#5C5C5C]' : 'border-[#D2B48C]'}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Eliminar artículo</p>
                        </TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <Dialog>
            <DialogTrigger asChild>
              <Button className={`mt-8 ${darkMode ? 'bg-[#8B4513] hover:bg-[#A0522D] text-[#F0E6D2]' : 'bg-[#D2B48C] hover:bg-[#CD853F] text-[#4A4A4A]'}`}>
                <Plus className="mr-2 h-4 w-4" /> Agregar Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent className={`z-50 ${darkMode ? 'bg-[#3A3A3A] text-[#F0E6D2]' : 'bg-[#FFF8E7] text-[#4A4A4A]'}`}>
              <DialogHeader>
                <DialogTitle>Agregar Nueva Categoría</DialogTitle>
                <DialogDescription>
                  
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder="Nombre de la nueva categoría"
                onChange={(e) => setEditingCategory(e.target.value)}
                className={`border-2 focus:ring-2 ${darkMode ? 'bg-[#4A4A4A] border-[#5C5C5C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#F0E6D2]' : 'bg-[#FFFFFF] border-[#D2B48C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#4A4A4A]'}`}
              />
              <Button onClick={() => addCategory(editingCategory)} className={`${darkMode ? 'bg-[#8B4513] hover:bg-[#A0522D] text-[#F0E6D2]' : 'bg-[#D2B48C] hover:bg-[#CD853F] text-[#4A4A4A]'}`}>
                <Save className="mr-2 h-4 w-4" /> Guardar
              </Button>
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-8 text-center opacity-75">
          <p className={darkMode ? 'text-[#D2B48C]' : 'text-[#8B4513]'}>Lista de Compras del Bosque - Inspirada en "Over the Garden Wall"</p>
        </div>
      </div>
    </TooltipProvider>
  )
}