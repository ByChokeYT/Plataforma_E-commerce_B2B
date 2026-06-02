package main

/* ══════════════════════════════════════════════════════════════════════════════
   main.go — Servidor Backend API & Archivos Estáticos en Go
   
   Propósito educativo:
     · Muestra a los alumnos cómo levantar un servidor HTTP nativo en Go.
     · Expone una API REST para consultar productos y clientes.
     · Procesa y registra en consola las órdenes de compra (B2B checkout).
     · Sirve los archivos estáticos de la SPA (HTML, CSS, JS) en el puerto 3000.
     
   Cómo ejecutar:
     $ go run main.go
   ══════════════════════════════════════════════════════════════════════════════ */

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

// Tier representa las escalas de precios por volumen
type Tier struct {
	Min   int     `json:"min"`
	Price float64 `json:"price"`
}

// Product representa la estructura de un producto industrial
type Product struct {
	ID        int     `json:"id"`
	Name      string  `json:"name"`
	Category  string  `json:"category"`
	BasePrice float64 `json:"basePrice"`
	Stock     int     `json:"stock"`
	Image     string  `json:"image"`
	Tiers     []Tier  `json:"tiers"`
}

// Customer representa un perfil de cliente B2B y su línea de crédito
type Customer struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Level       string  `json:"level"`
	Discount    float64 `json:"discount"`
	CreditLimit float64 `json:"creditLimit"`
	UsedCredit  float64 `json:"usedCredit"`
}

// OrderItem representa un producto dentro de una orden de compra
type OrderItem struct {
	ID       int     `json:"id"`
	Name     string  `json:"name"`
	Quantity int     `json:"quantity"`
	Price    float64 `json:"price"`
}

// Order representa la orden de compra recibida en el checkout
type Order struct {
	ID         string      `json:"id"`
	Date       string      `json:"date"`
	Total      float64     `json:"total"`
	Status     string      `json:"status"`
	ItemsCount int         `json:"itemsCount"`
	Items      []OrderItem `json:"orderItems"`
}

// DATOS MAESTROS (Semilla en memoria)
var productsList = []Product{
	{ID: 1, Name: "Procesador Industrial X-100", Category: "Componentes", BasePrice: 450.00, Stock: 120, Image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&h=600&fit=crop", Tiers: []Tier{{Min: 1, Price: 450}, {Min: 10, Price: 410}, {Min: 50, Price: 380}}},
	{ID: 2, Name: "Módulo de Control PLC-7", Category: "Automatización", BasePrice: 890.00, Stock: 45, Image: "https://images.unsplash.com/photo-1580983553083-cde3bceb1e16?w=600&h=600&fit=crop", Tiers: []Tier{{Min: 1, Price: 890}, {Min: 5, Price: 840}, {Min: 15, Price: 790}}},
	{ID: 3, Name: "Cableado Estructurado Cat8 (Rollo 100m)", Category: "Redes", BasePrice: 120.00, Stock: 500, Image: "https://images.unsplash.com/photo-1544244015-0cd4b3ffc6b0?w=600&h=600&fit=crop", Tiers: []Tier{{Min: 1, Price: 120}, {Min: 20, Price: 105}, {Min: 100, Price: 85}}},
	{ID: 4, Name: "Sensor de Proximidad Laser v2", Category: "Sensores", BasePrice: 65.00, Stock: 210, Image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=600&fit=crop", Tiers: []Tier{{Min: 1, Price: 65}, {Min: 50, Price: 55}, {Min: 200, Price: 45}}},
	{ID: 5, Name: "Servidor Rack Mount 2U XEON", Category: "Componentes", BasePrice: 2450.00, Stock: 15, Image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop", Tiers: []Tier{{Min: 1, Price: 2450}, {Min: 3, Price: 2200}, {Min: 10, Price: 1950}}},
	{ID: 6, Name: "Gateway IoT Industrial Pro", Category: "Conectividad", BasePrice: 320.00, Stock: 85, Image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=600&fit=crop", Tiers: []Tier{{Min: 1, Price: 320}, {Min: 10, Price: 290}, {Min: 50, Price: 260}}},
	{ID: 7, Name: "Cámara Térmica de Inspección", Category: "Seguridad", BasePrice: 1560.00, Stock: 12, Image: "https://images.unsplash.com/photo-1551703599-6b3e8379aa8b?w=600&h=600&fit=crop", Tiers: []Tier{{Min: 1, Price: 1560}, {Min: 5, Price: 1400}}},
	{ID: 8, Name: "Unidad de Almacenamiento NAS 40TB", Category: "Componentes", BasePrice: 1800.00, Stock: 25, Image: "https://images.unsplash.com/photo-1597733336794-12d05021d510?w=600&h=600&fit=crop", Tiers: []Tier{{Min: 1, Price: 1800}, {Min: 4, Price: 1650}}},
	{ID: 9, Name: "Monitor Industrial 4K 32\"", Category: "Componentes", BasePrice: 750.00, Stock: 40, Image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop", Tiers: []Tier{{Min: 1, Price: 750}, {Min: 10, Price: 680}}},
	{ID: 10, Name: "Adaptador Fibra Óptica Duplex", Category: "Redes", BasePrice: 45.00, Stock: 1000, Image: "https://images.unsplash.com/photo-1544244015-0cd4b3ffc6b0?w=600&h=600&fit=crop", Tiers: []Tier{{Min: 1, Price: 45}, {Min: 100, Price: 35}}},
	{ID: 11, Name: "Interruptor Automático 600V", Category: "Electricidad", BasePrice: 185.00, Stock: 150, Image: "https://images.unsplash.com/photo-1558444479-c8402a31653c?w=600&h=600&fit=crop", Tiers: []Tier{{Min: 1, Price: 185}, {Min: 20, Price: 165}}},
	{ID: 12, Name: "Transformador Seco 50kVA", Category: "Electricidad", BasePrice: 3400.00, Stock: 5, Image: "https://images.unsplash.com/photo-1610056494052-6a4f83a8368c?w=600&h=600&fit=crop", Tiers: []Tier{{Min: 1, Price: 3400}}},
	{ID: 13, Name: "Kit Herramientas Precision Pro", Category: "Mantenimiento", BasePrice: 150.00, Stock: 200, Image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&h=600&fit=crop", Tiers: []Tier{{Min: 1, Price: 150}, {Min: 50, Price: 120}}},
	{ID: 14, Name: "Router Industrial 5G Dual SIM", Category: "Redes", BasePrice: 480.00, Stock: 60, Image: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&h=600&fit=crop", Tiers: []Tier{{Min: 1, Price: 480}, {Min: 10, Price: 440}}},
	{ID: 15, Name: "Panel Solar Mono-Cristalino 400W", Category: "Energía", BasePrice: 210.00, Stock: 300, Image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&h=600&fit=crop", Tiers: []Tier{{Min: 1, Price: 210}, {Min: 100, Price: 175}}},
}

var customersMap = map[string]Customer{
	"C-9901": {ID: "C-9901", Name: "Sistemas Industriales S.A.", Level: "Distribuidor", Discount: 0.10, CreditLimit: 50000, UsedCredit: 12500},
	"C-8842": {ID: "C-8842", Name: "Global Tech Solutions", Level: "Partner Premium", Discount: 0.20, CreditLimit: 150000, UsedCredit: 45000},
}

func main() {
	// ─── API: RETORNAR LISTA DE PRODUCTOS ───────────────────
	http.HandleFunc("/api/products", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode(productsList)
	})

	// ─── API: RETORNAR PERFILES DE CLIENTES ─────────────────
	http.HandleFunc("/api/customers", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode(customersMap)
	})

	// ─── API: PROCESAR NUEVA ORDEN DE COMPRA (B2B CHECKOUT) ───
	http.HandleFunc("/api/orders", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Manejo de Preflight CORS
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		if r.Method != http.MethodPost {
			http.Error(w, "Metodo no permitido", http.StatusMethodNotAllowed)
			return
		}

		var newOrder Order
		err := json.NewDecoder(r.Body).Decode(&newOrder)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// LOG DEL SERVIDOR GO: Impresión de reporte detallado en consola
		fmt.Printf("\n[Go-Backend] 📦 Nueva orden recibida a las %s\n", time.Now().Format("15:04:05"))
		fmt.Printf("  • ID Orden:  %s\n", newOrder.ID)
		fmt.Printf("  • Total:     Bs. %.2f (Estado: %s)\n", newOrder.Total, newOrder.Status)
		fmt.Printf("  • Productos: %d\n", newOrder.ItemsCount)
		for _, item := range newOrder.Items {
			fmt.Printf("    - SKU %04d | Cantidad: %d | %s (Bs. %.2f c/u)\n", item.ID, item.Quantity, item.Name, item.Price)
		}
		fmt.Println("--------------------------------------------------------------------------------")

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "Orden procesada y registrada en el servidor Go",
			"orderId": newOrder.ID,
		})
	})

	// ─── SERVIR FRONTEND ESTÁTICO (SPA SHELL) ─────────────────
	// Sirve todo el directorio actual (.) como raíz estática.
	fileServer := http.FileServer(http.Dir("."))
	http.Handle("/", fileServer)

	port := ":3000"
	fmt.Printf("[Go-Backend] Servidor B2B corriendo en http://localhost%s\n", port)
	fmt.Println("[Go-Backend] Servidor de archivos estaticos y endpoints de API REST listos.")
	fmt.Println("[Go-Backend] Presiona Ctrl+C para detener.")

	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatalf("Error al iniciar el servidor Go: %v", err)
	}
}
