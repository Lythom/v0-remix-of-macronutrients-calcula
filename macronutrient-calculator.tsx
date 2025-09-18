"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, X, ChevronsUpDown as ChevronUpDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FoodItem {
  id: string
  name: string
  price: number
  weight: number
  protein: number
  carbs: number
  fats: number
  calories: number
}

export default function Component() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([
    {
      id: "1",
      name: "",
      price: 0,
      weight: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      calories: 0,
    },
  ])

  const [savedItems, setSavedItems] = useState<FoodItem[]>([])
  const [sortBy, setSortBy] = useState<"name" | "price" | "protein" | "carbs" | "fats" | "total">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric")
  const [currency, setCurrency] = useState<"EUR" | "USD">("EUR")

  const totalCalculations = useMemo(() => {
    const totals = foodItems.reduce(
      (acc, item) => ({
        price: acc.price + item.price,
        weight: acc.weight + item.weight,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fats: acc.fats + item.fats,
        calories: acc.calories + item.calories,
      }),
      { price: 0, weight: 0, protein: 0, carbs: 0, fats: 0, calories: 0 },
    )

    if (totals.price <= 0) return null

    const pricePerGramProtein = totals.protein > 0 ? totals.price / totals.protein : 0
    const pricePerGramCarbs = totals.carbs > 0 ? totals.price / totals.carbs : 0
    const pricePerGramFats = totals.fats > 0 ? totals.price / totals.fats : 0
    const pricePerCalorie = totals.calories > 0 ? totals.price / totals.calories : 0

    const totalMacros = totals.protein + totals.carbs + totals.fats

    // Calculate per 100g for combined totals
    const per100g =
      totals.weight > 0
        ? {
            price: (totals.price / totals.weight) * 100,
            protein: (totals.protein / totals.weight) * 100,
            carbs: (totals.carbs / totals.weight) * 100,
            fats: (totals.fats / totals.weight) * 100,
            calories: (totals.calories / totals.weight) * 100,
          }
        : null

    return {
      totals,
      perGram: {
        protein: pricePerGramProtein,
        carbs: pricePerGramCarbs,
        fats: pricePerGramFats,
      },
      perCalorie: pricePerCalorie,
      totalMacros,
      per100g,
    }
  }, [foodItems])

  const sortSavedItems = useMemo(() => {
    return [...savedItems].sort((a, b) => {
      let aValue: number | string
      let bValue: number | string

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "price":
          aValue = a.price
          bValue = b.price
          break
        case "protein":
          aValue = a.protein > 0 ? a.price / a.protein : Number.POSITIVE_INFINITY
          bValue = b.protein > 0 ? b.price / b.protein : Number.POSITIVE_INFINITY
          break
        case "carbs":
          aValue = a.carbs > 0 ? a.price / a.carbs : Number.POSITIVE_INFINITY
          bValue = b.carbs > 0 ? b.price / b.carbs : Number.POSITIVE_INFINITY
          break
        case "fats":
          aValue = a.fats > 0 ? a.price / a.fats : Number.POSITIVE_INFINITY
          bValue = b.fats > 0 ? b.price / b.fats : Number.POSITIVE_INFINITY
          break
        case "total":
          const aTotalMacros = a.protein + a.carbs + a.fats
          const bTotalMacros = b.protein + b.carbs + b.fats
          aValue = aTotalMacros > 0 ? a.price / aTotalMacros : Number.POSITIVE_INFINITY
          bValue = bTotalMacros > 0 ? b.price / bTotalMacros : Number.POSITIVE_INFINITY
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      const numA = aValue as number
      const numB = bValue as number
      return sortOrder === "asc" ? numA - numB : numB - numA
    })
  }, [savedItems, sortBy, sortOrder])

  const handleInputChange = (id: string, field: keyof Omit<FoodItem, "id">, value: string) => {
    setFoodItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item

        const newItem = {
          ...item,
          [field]: field === "name" ? value : value === "" ? 0 : Number.parseFloat(value) || 0,
        }

        // Auto-calculate calories when macronutrients change
        if (field === "protein" || field === "carbs" || field === "fats") {
          const protein = field === "protein" ? Number.parseFloat(value) || 0 : item.protein
          const carbs = field === "carbs" ? Number.parseFloat(value) || 0 : item.carbs
          const fats = field === "fats" ? Number.parseFloat(value) || 0 : item.fats

          // Calculate calories: protein = 4 cal/g, carbs = 4 cal/g, fats = 9 cal/g
          const calculatedCalories = protein * 4 + carbs * 4 + fats * 9
          newItem.calories = calculatedCalories
        }

        return newItem
      }),
    )
  }

  const addFoodItem = () => {
    const newId = Date.now().toString()
    setFoodItems((prev) => [
      ...prev,
      {
        id: newId,
        name: "",
        price: 0,
        weight: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        calories: 0,
      },
    ])
  }

  const removeFoodItem = (id: string) => {
    if (foodItems.length > 1) {
      setFoodItems((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const saveCalculation = () => {
    const validItems = foodItems.filter(
      (item) =>
        item.name && item.price > 0 && (item.protein > 0 || item.carbs > 0 || item.fats > 0 || item.calories > 0),
    )

    if (validItems.length > 0) {
      setSavedItems((prev) => [...prev, ...validItems])
    }
  }

  const clearForm = () => {
    setFoodItems([
      {
        id: "1",
        name: "",
        price: 0,
        weight: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        calories: 0,
      },
    ])
  }

  const clearSavedItems = () => {
    setSavedItems([])
  }

  const removeSavedItem = (indexToRemove: number) => {
    setSavedItems((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const formatPrice = (price: number) => {
    const convertedPrice = currency === "USD" ? price * 1.1 : price // Approximate EUR to USD conversion
    return new Intl.NumberFormat(currency === "USD" ? "en-US" : "de-DE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(convertedPrice)
  }

  // Calculate price per 100g for an item
  const calculatePricePer100g = (item: FoodItem) => {
    if (item.weight <= 0) return null
    return {
      price: (item.price / item.weight) * 100,
      protein: (item.protein / item.weight) * 100,
      carbs: (item.carbs / item.weight) * 100,
      fats: (item.fats / item.weight) * 100,
      calories: (item.calories / item.weight) * 100,
    }
  }

  // Find the best value (lowest cost per gram)
  const getBestValue = () => {
    if (!totalCalculations) return null

    const values = []
    if (totalCalculations.totals.protein > 0) values.push({ type: "protein", price: totalCalculations.perGram.protein })
    if (totalCalculations.totals.carbs > 0) values.push({ type: "carbs", price: totalCalculations.perGram.carbs })
    if (totalCalculations.totals.fats > 0) values.push({ type: "fats", price: totalCalculations.perGram.fats })

    if (values.length === 0) return null

    return values.reduce((best, current) => (current.price < best.price ? current : best))
  }

  // Get value rating with simpler scale
  const getValueRating = (price: number) => {
    if (price <= 0.1) return { rating: "Great", color: "bg-green-100 text-green-800" }
    if (price <= 0.3) return { rating: "Good", color: "bg-blue-100 text-blue-800" }
    if (price <= 0.5) return { rating: "OK", color: "bg-yellow-100 text-yellow-800" }
    return { rating: "Pricey", color: "bg-red-100 text-red-800" }
  }

  // Converter functions
  const convertWeight = (grams: number) => {
    return unitSystem === "imperial" ? grams * 0.035274 : grams // grams to ounces
  }

  const formatWeight = (weight: number) => {
    const converted = convertWeight(weight)
    return unitSystem === "imperial" ? `${converted.toFixed(1)} oz` : `${weight.toFixed(1)}g`
  }

  const getWeightUnit = () => (unitSystem === "imperial" ? "oz" : "g")
  const getWeightLabel = () => (unitSystem === "imperial" ? "Weight (oz)" : "Weight (g)")

  const bestValue = getBestValue()

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Macronutrient Price Calculator</h1>
        </div>

        {/* Unit and Theme Toggle */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-4 p-2 rounded-lg border shadow-sm bg-white">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Units:</span>
              <Button
                variant={unitSystem === "metric" ? "default" : "outline"}
                size="sm"
                onClick={() => setUnitSystem("metric")}
                className="h-8"
              >
                Metric
              </Button>
              <Button
                variant={unitSystem === "imperial" ? "default" : "outline"}
                size="sm"
                onClick={() => setUnitSystem("imperial")}
                className="h-8"
              >
                Imperial
              </Button>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Currency:</span>
              <Button
                variant={currency === "EUR" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrency("EUR")}
                className="h-8"
              >
                EUR (€)
              </Button>
              <Button
                variant={currency === "USD" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrency("USD")}
                className="h-8"
              >
                USD ($)
              </Button>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <Card className="shadow-sm border-2 border-purple-200 bg-purple-50">
          <CardHeader className="pb-4 bg-white">
            <CardTitle className="text-lg text-left">{"Food Product"} </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 bg-white">
            {foodItems.map((foodItem, index) => (
              <div key={foodItem.id} className="p-4 border rounded-lg space-y-4 bg-white border-gray-200">
                {foodItems.length > 1 && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFoodItem(foodItem.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-left">
                    <Label htmlFor={`name-${foodItem.id}`} className="text-sm font-medium text-left">
                      Name
                    </Label>
                    <Input
                      className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      id={`name-${foodItem.id}`}
                      placeholder="e.g., Chicken Breast"
                      value={foodItem.name}
                      onChange={(e) => handleInputChange(foodItem.id, "name", e.target.value)}
                    />
                  </div>
                  <div className="text-left">
                    <Label htmlFor={`price-${foodItem.id}`} className="text-sm font-medium text-center">
                      Price ({currency === "USD" ? "$" : "€"})
                    </Label>
                    <Input
                      className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      id={`price-${foodItem.id}`}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={foodItem.price === 0 ? "" : foodItem.price.toString()}
                      onChange={(e) => handleInputChange(foodItem.id, "price", e.target.value)}
                    />
                  </div>
                  <div className="text-left">
                    <Label htmlFor={`weight-${foodItem.id}`} className="text-sm font-medium text-left">
                      {getWeightLabel()}
                    </Label>
                    <Input
                      className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      id={`weight-${foodItem.id}`}
                      type="number"
                      step={unitSystem === "imperial" ? "0.1" : "1"}
                      placeholder={unitSystem === "imperial" ? "0.0" : "0"}
                      value={
                        foodItem.weight === 0
                          ? ""
                          : unitSystem === "imperial"
                            ? convertWeight(foodItem.weight).toFixed(1)
                            : foodItem.weight.toString()
                      }
                      onChange={(e) => {
                        const inputValue = e.target.value
                        const actualWeight =
                          unitSystem === "imperial" && inputValue
                            ? Number.parseFloat(inputValue) / 0.035274
                            : Number.parseFloat(inputValue) || 0
                        handleInputChange(foodItem.id, "weight", actualWeight.toString())
                      }}
                    />
                  </div>
                </div>

                {/* Macronutrients */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-left">
                    <Label htmlFor={`protein-${foodItem.id}`} className="text-sm font-medium text-red-500">
                      Proteins (g)
                    </Label>
                    <Input
                      className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      id={`protein-${foodItem.id}`}
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={foodItem.protein === 0 ? "" : foodItem.protein.toString()}
                      onChange={(e) => handleInputChange(foodItem.id, "protein", e.target.value)}
                    />
                  </div>
                  <div className="text-left">
                    <Label htmlFor={`carbs-${foodItem.id}`} className="text-sm font-medium text-center text-lime-500">
                      Carbohydrates (g)
                    </Label>
                    <Input
                      className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      id={`carbs-${foodItem.id}`}
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={foodItem.carbs === 0 ? "" : foodItem.carbs.toString()}
                      onChange={(e) => handleInputChange(foodItem.id, "carbs", e.target.value)}
                    />
                  </div>
                  <div className="text-left">
                    <Label htmlFor={`fats-${foodItem.id}`} className="text-sm font-medium text-yellow-500">
                      Fats (g)
                    </Label>
                    <Input
                      className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      id={`fats-${foodItem.id}`}
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={foodItem.fats === 0 ? "" : foodItem.fats.toString()}
                      onChange={(e) => handleInputChange(foodItem.id, "fats", e.target.value)}
                    />
                  </div>
                  <div className="text-left">
                    <Label htmlFor={`calories-${foodItem.id}`} className="text-sm font-medium text-blue-500">
                      Calories (kcal)
                    </Label>
                    <Input
                      className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      id={`calories-${foodItem.id}`}
                      type="number"
                      step="1"
                      placeholder="0"
                      value={foodItem.calories === 0 ? "" : foodItem.calories.toString()}
                      onChange={(e) => handleInputChange(foodItem.id, "calories", e.target.value)}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <Button
                onClick={addFoodItem}
                variant="outline"
                className="flex items-center gap-2 bg-transparent text-center"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
              <Button onClick={saveCalculation} className="flex-1 text-center">
                Save
              </Button>
              <Button className="text-red-500 bg-transparent" onClick={clearForm} variant="outline">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {totalCalculations && (
          <div className="space-y-6">
            <Card className="shadow-sm border-2 border-purple-200 bg-purple-50">
              <CardHeader className="pb-4 bg-white">
                <CardTitle className="text-lg">Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 bg-white">
                {/* Cost per nutrient */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Cost per Nutrient</h4>
                  <div className="space-y-3">
                    {totalCalculations.totals.protein > 0 && (
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg border ${bestValue?.type === "protein" ? "bg-green-100 border-green-300" : "bg-white"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="font-medium">Proteins</span>
                          <span className="text-sm text-gray-600">
                            ({totalCalculations.totals.protein.toFixed(1)}g)
                          </span>
                        </div>
                        <div>
                          <span className="text-lg font-bold">{formatPrice(totalCalculations.perGram.protein)}/g</span>
                          {bestValue?.type === "protein" && (
                            <Badge className="ml-2 bg-green-600 text-white text-xs">Best Value</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {totalCalculations.totals.carbs > 0 && (
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg border ${bestValue?.type === "carbs" ? "bg-green-100 border-green-300" : "bg-white"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-lime-500"></div>
                          <span className="font-medium">Carbohydrates</span>
                          <span className="text-sm text-gray-600">({totalCalculations.totals.carbs.toFixed(1)}g)</span>
                        </div>
                        <div className="text-justify">
                          <span className="text-lg font-bold">{formatPrice(totalCalculations.perGram.carbs)}/g</span>
                          {bestValue?.type === "carbs" && (
                            <Badge className="ml-2 text-white text-xs bg-lime-500">Best Value</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {totalCalculations.totals.fats > 0 && (
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg border ${bestValue?.type === "fats" ? "bg-green-100 border-green-300" : "bg-white"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="font-medium">Fats</span>
                          <span className="text-sm text-gray-600">({totalCalculations.totals.fats.toFixed(1)}g)</span>
                        </div>
                        <div>
                          <span className="text-lg font-bold">{formatPrice(totalCalculations.perGram.fats)}/g</span>
                          {bestValue?.type === "fats" && (
                            <Badge className="ml-2 bg-green-600 text-white text-xs">Best Value</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {totalCalculations.totals.calories > 0 && (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="font-medium">Energy</span>
                          <span className="text-sm text-gray-600">
                            ({totalCalculations.totals.calories.toFixed(0)} kcal)
                          </span>
                        </div>
                        <div>
                          <span className="text-lg font-bold">{formatPrice(totalCalculations.perCalorie)}/kcal</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Saved Items */}
        {savedItems.length > 0 && (
          <Card className="shadow-sm border-2 border-purple-200 bg-purple-50">
            <CardHeader className="pb-4 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-lg">Saved Items ({savedItems.length})</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Sort by:</span>
                    <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="protein">Protein Value</SelectItem>
                        <SelectItem value="carbs">Carb Value</SelectItem>
                        <SelectItem value="fats">Fat Value</SelectItem>
                        <SelectItem value="total">Total Value</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="h-8 w-8 p-0"
                      title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
                    >
                      <ChevronUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSavedItems}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent h-8"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 bg-white">
              <div className="space-y-4">
                {sortSavedItems.map((item, index) => {
                  const originalIndex = savedItems.findIndex(
                    (originalItem) =>
                      originalItem.id === item.id ||
                      (originalItem.name === item.name && originalItem.price === item.price),
                  )
                  const totalMacros = item.protein + item.carbs + item.fats
                  const per100g = calculatePricePer100g(item)
                  return (
                    <div
                      key={`${item.name}-${item.price}-${index}`}
                      className="p-4 border rounded-lg bg-white border-gray-200"
                    >
                      {/* Rest of the item content remains the same, but update the remove button */}
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-lg">{item.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-sm">
                            {formatPrice(item.price)}
                          </Badge>
                          {per100g && (
                            <Badge variant="secondary" className="text-sm">
                              {formatPrice(per100g.price)}/100g
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSavedItem(originalIndex)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {/* Keep the rest of the item display code the same */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {item.protein > 0 && (
                          <div className="text-center p-2 bg-red-50 rounded">
                            <div className="text-red-600 font-medium">Proteins</div>
                            <div className="font-bold">{formatPrice(item.price / item.protein)}/g</div>
                            <div className="text-xs mt-1">
                              {(() => {
                                const rating = getValueRating(item.price / item.protein)
                                return <span>{rating.rating}</span>
                              })()}
                            </div>
                          </div>
                        )}
                        {item.carbs > 0 && (
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="text-green-600 font-medium">Carbs</div>
                            <div className="font-bold">{formatPrice(item.price / item.carbs)}/g</div>
                            <div className="text-xs mt-1">
                              {(() => {
                                const rating = getValueRating(item.price / item.carbs)
                                return <span>{rating.rating}</span>
                              })()}
                            </div>
                          </div>
                        )}
                        {item.fats > 0 && (
                          <div className="text-center p-2 bg-yellow-50 rounded">
                            <div className="text-yellow-600 font-medium">Fats</div>
                            <div className="font-bold">{formatPrice(item.price / item.fats)}/g</div>
                            <div className="text-xs mt-1">
                              {(() => {
                                const rating = getValueRating(item.price / item.fats)
                                return <span>{rating.rating}</span>
                              })()}
                            </div>
                          </div>
                        )}
                        {totalMacros > 0 && (
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="text-blue-600 font-medium">Total</div>
                            <div className="font-bold">{formatPrice(item.price / totalMacros)}/g</div>
                            <div className="text-xs mt-1">
                              {(() => {
                                const rating = getValueRating(item.price / totalMacros)
                                return <span>{rating.rating}</span>
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                      {item.calories > 0 && (
                        <div className="mt-2 text-xs text-gray-600 text-center">{item.calories.toFixed(1)} kcal</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
