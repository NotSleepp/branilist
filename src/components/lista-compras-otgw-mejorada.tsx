'use client'

import { useState, useEffect, useMemo } from 'react'
import { Check, X, Plus, Trash2, Edit2, Save, Filter, Moon, Sun, Flower2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { motion, AnimatePresence } from "framer-motion"

type Item = {
  id: string
  text: string
  completed: boolean
  category: string
  createdAt: number
  icon: string
}

const defaultCategories = [
  "Alimentos",
  "Hogar",
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

export function ListaComprasOtgwMejorada() {
  const [items, setItems] = useState<Item[]>([])
  const [newItem, setNewItem] = useState('')
  const [newCategory, setNewCategory] = useState(defaultCategories[0])
  const [newIcon, setNewIcon] = useState('')
  const [categories, setCategories] = useState(defaultCategories)
  const [editingCategory, setEditingCategory] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('dateAdded')
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedItems = localStorage.getItem('otgwShoppingListImproved')
    const savedCategories = localStorage.getItem('otgwShoppingListCategoriesImproved')
    const savedDarkMode = localStorage.getItem('otgwShoppingListDarkModeImproved')
    if (savedItems) setItems(JSON.parse(savedItems))
    if (savedCategories) setCategories(JSON.parse(savedCategories))
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode))
  }, [])

  useEffect(() => {
    localStorage.setItem('otgwShoppingListImproved', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    localStorage.setItem('otgwShoppingListCategoriesImproved', JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem('otgwShoppingListDarkModeImproved', JSON.stringify(darkMode))
  }, [darkMode])

  const addItem = () => {
    if (newItem.trim() !== '') {
      setItems([...items, { 
        id: Date.now().toString(), 
        text: newItem, 
        completed: false, 
        category: newCategory,
        createdAt: Date.now(),
        icon: newIcon || iconOptions[Math.floor(Math.random() * iconOptions.length)].value
      }])
      setNewItem('')
      setNewIcon('')
    }
  }

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const editItem = (id: string, newText: string, newCategory: string, newIcon: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, text: newText, category: newCategory, icon: newIcon } : item
    ))
  }

  const addCategory = (category: string) => {
    if (category && !categories.includes(category)) {
      setCategories([...categories, category])
    }
  }

  const removeCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category))
    setItems(items.map(item => 
      item.category === category ? { ...item, category: 'Otros' } : item
    ))
  }

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filter === 'all') return true
      if (filter === 'completed') return item.completed
      if (filter === 'active') return !item.completed
      return item.category === filter
    })
  }, [items, filter])

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (sort === 'alphabetical') return a.text.localeCompare(b.text)
      if (sort === 'dateAdded') return b.createdAt - a.createdAt
      return 0
    })
  }, [filteredItems, sort])

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
            <h1 className="text-4xl font-bold text-center text-[#8B4513]">Lista de Compras del Bosque</h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  className="ml-4"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{darkMode ? 'Modo día' : 'Modo noche'}</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`mb-8 p-6 rounded-lg shadow-md border ${darkMode ? 'bg-[#4A4A4A] border-[#5C5C5C]' : 'bg-[#FFFFFF] border-[#D2B48C]'}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1">
                <Label htmlFor="new-item" className={`text-lg font-semibold mb-2 block ${darkMode ? 'text-[#F0E6D2]' : 'text-[#8B4513]'}`}>Nuevo Artículo</Label>
                <Input
                  id="new-item"
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem()}
                  className={`border-2 focus:ring-2 text-lg py-3 ${darkMode ? 'bg-[#3A3A3A] border-[#5C5C5C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#F0E6D2]' : 'bg-[#FFF8E7] border-[#D2B48C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#4A4A4A]'}`}
                  placeholder="Añade un artículo..."
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="category" className={`text-lg font-semibold mb-2 block ${darkMode ? 'text-[#F0E6D2]' : 'text-[#8B4513]'}`}>Categoría</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger id="category" className={`border-2 focus:ring-2 text-lg py-3 ${darkMode ? 'bg-[#3A3A3A] border-[#5C5C5C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#F0E6D2]' : 'bg-[#FFF8E7] border-[#D2B48C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#4A4A4A]'}`}>
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
              </div>
            </div>
            <Button onClick={addItem} className={`w-full mt-4 text-lg py-6 ${darkMode ? 'bg-[#8B4513] hover:bg-[#A0522D] text-[#F0E6D2]' : 'bg-[#D2B48C] hover:bg-[#CD853F] text-[#4A4A4A]'}`}>
              <Plus className="mr-2 h-5 w-5" /> Añadir
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 flex flex-col md:flex-row  justify-between items-center space-y-4 md:space-y-0"
          >
            <div className="flex items-center space-x-2">
              <Label htmlFor="filter" className={`text-lg font-semibold ${darkMode ? 'text-[#F0E6D2]' : 'text-[#8B4513]'}`}>Filtrar:</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger id="filter" className={`w-[180px] border-2 focus:ring-2 ${darkMode ? 'bg-[#3A3A3A] border-[#5C5C5C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#F0E6D2]' : 'bg-[#FFF8E7] border-[#D2B48C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#4A4A4A]'}`}>
                  <SelectValue placeholder="Filtrar por" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
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
                  <SelectItem value="dateAdded">Fecha añadido</SelectItem>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => toggleItem(item.id)}
                        variant="outline"
                        size="icon"
                        className={`${item.completed ? (darkMode ? 'bg-[#8B4513] text-[#F0E6D2]' : 'bg-[#D2B48C] text-[#4A4A4A]') : (darkMode ? 'bg-[#3A3A3A] text-[#F0E6D2]' : 'bg-[#FFF8E7] text-[#4A4A4A]')} border-[#8B4513]`}
                      >
                        <Check className={`h-4 w-4 ${item.completed ? 'opacity-100' : 'opacity-0'}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.completed ? 'Marcar como incompleto' : 'Marcar como completo'}</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex-grow flex items-center space-x-2 overflow-hidden">
                    <span className={`text-2xl ${darkMode ? 'text-[#F0E6D2]' : 'text-[#8B4513]'}`}>{item.icon}</span>
                    <span className={`text-lg truncate ${item.completed ? 'line-through text-gray-500' : (darkMode ? 'text-[#F0E6D2]' : 'text-[#4A4A4A]')}`}>
                      {item.text}
                    </span>
                  </div>
                  <span className={`text-sm ${darkMode ? 'text-[#D2B48C]' : 'text-[#8B4513]'}`}>{item.category}</span>
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
                      </DialogHeader>
                      <Input
                        defaultValue={item.text}
                        onChange={(e) => setEditingCategory(e.target.value)}
                        className={`border-2 focus:ring-2 ${darkMode ? 'bg-[#4A4A4A] border-[#5C5C5C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#F0E6D2]' : 'bg-[#FFFFFF] border-[#D2B48C] focus:border-[#8B4513] focus:ring-[#8B4513] text-[#4A4A4A]'}`}
                      />
                      <Select defaultValue={item.category} onValueChange={(value) => editItem(item.id, editingCategory || item.text, value, item.icon)}>
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
                      <Select defaultValue={item.icon} onValueChange={(value) => editItem(item.id, editingCategory || item.text, item.category, value)}>
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
                      <Button onClick={() => editItem(item.id, editingCategory || item.text, item.category, item.icon)} className={`${darkMode ? 'bg-[#8B4513] hover:bg-[#A0522D] text-[#F0E6D2]' : 'bg-[#D2B48C] hover:bg-[#CD853F] text-[#4A4A4A]'}`}>
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
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <Dialog>
            <DialogTrigger asChild>
              <Button className={`mt-8 ${darkMode ? 'bg-[#8B4513] hover:bg-[#A0522D] text-[#F0E6D2]' : 'bg-[#D2B48C] hover:bg-[#CD853F] text-[#4A4A4A]'}`}>
                <Plus className="mr-2 h-4 w-4" /> Añadir Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent className={`z-50 ${darkMode ? 'bg-[#3A3A3A] text-[#F0E6D2]' : 'bg-[#FFF8E7] text-[#4A4A4A]'}`}>
              <DialogHeader>
                <DialogTitle>Añadir Nueva Categoría</DialogTitle>
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