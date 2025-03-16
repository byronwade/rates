import { EstimateTemplateConfig, EnhancedLineItem } from "@/components/estimates/template-engine";
import { Clock, Package, Bolt, Building, Users, Wrench } from "lucide-react";

// Template configuration for EnviroServer ES Series 450 GPD System
const EnviroServerES450Config: EstimateTemplateConfig = {
	id: "enviroserver-es-450",
	name: "EnviroServer ES Series 450 GPD System",
	icon: Wrench, // Using Wrench as the primary icon
	description: "Installation estimate template for EnviroServer ES Series 450 GPD septic system with drip irrigation. Pricing reflects a 3.5% cash discount.",
	defaultProjectName: "EnviroServer ES Series 450 GPD Installation",
	defaultMaterialMarkup: 40,

	// Define categories for the estimate
	categories: [
		{
			id: "labor",
			name: "Labor",
			icon: Clock,
			shortName: "Labor",
		},
		{
			id: "materials",
			name: "Materials",
			icon: Package,
			shortName: "Materials",
		},
		{
			id: "electrical",
			name: "Electrical",
			icon: Bolt,
			shortName: "Electrical",
		},
		{
			id: "constructionMaterials",
			name: "Construction Materials",
			icon: Building,
			shortName: "Construction",
		},
		{
			id: "subcontractor",
			name: "Subcontractors",
			icon: Users,
			shortName: "Subcontractors",
		},
	],

	// Function to generate default line items based on the hourly rate
	defaultLineItems: (hourlyRate: number): EnhancedLineItem[] => {
		return [
			// Labor items
			{
				id: crypto.randomUUID(),
				name: "Site Assessment",
				description: "Labor for initial site assessment and soil testing",
				type: "labor",
				category: "labor",
				quantity: 1,
				hours: 2,
				price: hourlyRate,
				totalPrice: hourlyRate * 2,
			},
			{
				id: crypto.randomUUID(),
				name: "Site Preparation",
				description: "Labor for clearing, excavation, and grading",
				type: "labor",
				category: "labor",
				quantity: 1,
				hours: 40,
				price: hourlyRate,
				totalPrice: hourlyRate * 40,
			},
			{
				id: crypto.randomUUID(),
				name: "Tank Installation",
				description: "Labor to install treatment system tank",
				type: "labor",
				category: "labor",
				quantity: 1,
				hours: 8,
				price: hourlyRate,
				totalPrice: hourlyRate * 8,
			},
			{
				id: crypto.randomUUID(),
				name: "Drip System Installation",
				description: "Labor to install drip irrigation system",
				type: "labor",
				category: "labor",
				quantity: 1,
				hours: 40,
				price: hourlyRate,
				totalPrice: hourlyRate * 40,
			},
			{
				id: crypto.randomUUID(),
				name: "Control System Installation",
				description: "Labor for control panel and telemetry setup",
				type: "labor",
				category: "labor",
				quantity: 1,
				hours: 10,
				price: hourlyRate,
				totalPrice: hourlyRate * 10,
			},
			{
				id: crypto.randomUUID(),
				name: "Electrical Connections",
				description: "Labor for electrical wiring and controls",
				type: "labor",
				category: "electrical",
				quantity: 1,
				hours: 10,
				price: hourlyRate,
				totalPrice: hourlyRate * 10,
			},
			{
				id: crypto.randomUUID(),
				name: "System Testing",
				description: "Labor for system testing and inspection",
				type: "labor",
				category: "labor",
				quantity: 1,
				hours: 2,
				price: hourlyRate,
				totalPrice: hourlyRate * 2,
			},
			{
				id: crypto.randomUUID(),
				name: "Travel Time",
				description: "Labor for travel to/from project site",
				type: "labor",
				category: "labor",
				quantity: 1,
				hours: 24,
				price: hourlyRate,
				totalPrice: hourlyRate * 24,
			},

			// Materials with base prices (without markup)
			{
				id: crypto.randomUUID(),
				name: "ES4.5-TA EnviroServer ES Series 450 GPD - Tank Assembly",
				description: "Main treatment tank assembly",
				type: "material",
				category: "materials",
				quantity: 1,
				price: 10600, // Base cost
				wastage: 10, // Default wastage percentage
				totalPrice: 10600, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "ES4.5-BA EnviroServer ES Series 450 GPD - Base Assembly",
				description: "Base assembly for treatment system",
				type: "material",
				category: "materials",
				quantity: 1,
				price: 1350, // Base cost
				wastage: 10,
				totalPrice: 1350, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "SVR Solenoid Recirculation Option",
				description: "Solenoid valve for recirculation system",
				type: "material",
				category: "materials",
				quantity: 1,
				price: 295, // Base cost
				wastage: 10,
				totalPrice: 295, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "MCPR-G MST Control Panel, Grav/Timed Recirc",
				description: "Main control panel for system operation",
				type: "material",
				category: "electrical",
				quantity: 1,
				price: 2350, // Base cost
				wastage: 10,
				totalPrice: 2350, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "T100i Telemetry Monitoring Option - Internet",
				description: "Remote monitoring system via internet",
				type: "material",
				category: "electrical",
				quantity: 1,
				price: 895, // Base cost
				wastage: 10,
				totalPrice: 895, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "PCU Pump Control Upgrade",
				description: "Enhanced pump control system",
				type: "material",
				category: "electrical",
				quantity: 1,
				price: 400, // Base cost
				wastage: 10,
				totalPrice: 400, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "UV Ultra-Violet Disinfection Option (Salcor)",
				description: "UV treatment system for effluent",
				type: "material",
				category: "materials",
				quantity: 1,
				price: 1100, // Base cost
				wastage: 10,
				totalPrice: 1100, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "PPK-1.5-FMP100 Pump Plumbing Kit",
				description: '1.5" with 1" flow meter - no pipe',
				type: "material",
				category: "materials",
				quantity: 1,
				price: 375, // Base cost
				wastage: 10,
				totalPrice: 375, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "10DOM05121 Pump, Effluent, StaRite 120V",
				description: "Main effluent pump",
				type: "material",
				category: "materials",
				quantity: 1,
				price: 655.8, // Base cost
				wastage: 10,
				totalPrice: 655.8, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "GEO4-SIM-AUT Geoflow 2 to 4 zones",
				description: "115/230 VAC, 1 Phase, 2 hp max, Simplex pump, Auto flush",
				type: "material",
				category: "electrical",
				quantity: 1,
				price: 3325, // Base cost
				wastage: 10,
				totalPrice: 3325, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "BFA-1.5D-2ABV Back Flush Assembly",
				description: 'w/1.5" Disc Filter & Two Actuated Ball Valves (no valve box)',
				type: "material",
				category: "materials",
				quantity: 1,
				price: 1200, // Base cost
				wastage: 10,
				totalPrice: 1200, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: 'BTU-1000-E 1" PVC Tru-Union Ball Valve',
				description: "Ball valves for system control",
				type: "material",
				category: "materials",
				quantity: 2,
				price: 65, // Base cost per unit
				wastage: 10,
				totalPrice: 130, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: 'BVLVACT-10SS 1" SS Ball Valve',
				description: "9-24V AC/DC-2 wire, normally closed, autospring return",
				type: "material",
				category: "materials",
				quantity: 2,
				price: 228.98, // Base cost per unit
				wastage: 10,
				totalPrice: 457.96, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "PMR30-MF Pressure Regulator - 30 psi",
				description: '2-20 GPM 1" FIPT pressure regulator',
				type: "material",
				category: "materials",
				quantity: 2,
				price: 33.73, // Base cost per unit
				wastage: 10,
				totalPrice: 67.46, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "LTSLIP-600 Geoflow Lockslip Adapter",
				description: "50/bag adapter kit",
				type: "material",
				category: "materials",
				quantity: 1,
				price: 98, // Base cost
				wastage: 10,
				totalPrice: 98, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "WFPC16-4-12 Geoflow Wasteflow PC Dripline",
				description: '1 GPH, 12" spacing dripline',
				type: "material",
				category: "materials",
				quantity: 1000, // feet
				price: 0.67206, // Base cost per foot
				wastage: 10,
				totalPrice: 672.06, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: 'S1720-10 Spears 1" Tru-Union Swing Check Valve',
				description: "Check valves for system",
				type: "material",
				category: "materials",
				quantity: 2,
				price: 42.5, // Base cost per unit
				wastage: 10,
				totalPrice: 85, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: 'APVBK-100M Geoflow 1" MPT Kinetic Vent & Vacuum Relief Valve',
				description: "Air/vacuum relief valves",
				type: "material",
				category: "materials",
				quantity: 4,
				price: 30.58, // Base cost per unit
				wastage: 10,
				totalPrice: 122.32, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: 'AVBOX-6 Geoflow Air Vent - 6" round box',
				description: "Air vent boxes",
				type: "material",
				category: "materials",
				quantity: 4,
				price: 38.55, // Base cost per unit
				wastage: 10,
				totalPrice: 154.2, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: 'BFK-1 GTS Backflush/Cleanout Kit - 1"',
				description: "System maintenance kit",
				type: "material",
				category: "materials",
				quantity: 1,
				price: 275, // Base cost
				wastage: 10,
				totalPrice: 275, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "S/H-MST-NC Shipping & Handling (NorCal)",
				description: "Delivery of all system components",
				type: "material",
				category: "materials",
				quantity: 1,
				price: 1950, // Base cost
				wastage: 10,
				totalPrice: 1950, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Concrete Materials and Supplies",
				description: "Concrete for risers, foundation, and other required concrete work",
				type: "material",
				category: "constructionMaterials",
				quantity: 1,
				price: 2500, // Base cost
				wastage: 10,
				totalPrice: 2500, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Concrete Risers (not included in quote)",
				description: "Access risers for maintenance",
				type: "material",
				category: "constructionMaterials",
				quantity: 2,
				price: 225, // Base cost per unit
				wastage: 10,
				totalPrice: 450, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "3/4 Crushed Rock",
				description: "Crushed rock for drainage and base preparation",
				type: "material",
				category: "constructionMaterials",
				quantity: 1,
				price: 850, // Base cost
				wastage: 10,
				totalPrice: 850, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Pea Gravel",
				description: "Pea gravel for drainage around system",
				type: "material",
				category: "constructionMaterials",
				quantity: 1,
				price: 650, // Base cost
				wastage: 10,
				totalPrice: 650, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Erosion Control Seed Mix",
				description: "Seed mix for ground stabilization after installation",
				type: "material",
				category: "constructionMaterials",
				quantity: 1,
				price: 325, // Base cost
				wastage: 10,
				totalPrice: 325, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Straw Wattles",
				description: "Wattles for water runoff and erosion control",
				type: "material",
				category: "constructionMaterials",
				quantity: 4,
				price: 65, // Base cost per unit
				wastage: 10,
				totalPrice: 260, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Hay Bales",
				description: "Hay bales for erosion control",
				type: "material",
				category: "constructionMaterials",
				quantity: 10,
				price: 18, // Base cost per unit
				wastage: 10,
				totalPrice: 180, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Electrical Wiring - Green",
				description: "500ft of green electrical wire for system connections",
				type: "material",
				category: "electrical",
				quantity: 500, // feet
				price: 0.45, // Base cost per foot
				wastage: 10,
				totalPrice: 225, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Electrical Wiring - Black",
				description: "500ft of black electrical wire for system connections",
				type: "material",
				category: "electrical",
				quantity: 500, // feet
				price: 0.45, // Base cost per foot
				wastage: 10,
				totalPrice: 225, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Electrical Wiring - White",
				description: "500ft of white electrical wire for system connections",
				type: "material",
				category: "electrical",
				quantity: 500, // feet
				price: 0.45, // Base cost per foot
				wastage: 10,
				totalPrice: 225, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Electrical Wiring - Red",
				description: "500ft of red electrical wire for system connections",
				type: "material",
				category: "electrical",
				quantity: 500, // feet
				price: 0.45, // Base cost per foot
				wastage: 10,
				totalPrice: 225, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Unistrut",
				description: "Metal framing system for mounting equipment",
				type: "material",
				category: "constructionMaterials",
				quantity: 20, // pieces
				price: 25, // Base cost per piece
				wastage: 10,
				totalPrice: 500, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "4x4 Lumber - 10ft",
				description: "10ft long 4x4 pressure treated posts for structural support",
				type: "material",
				category: "constructionMaterials",
				quantity: 8, // pieces
				price: 32, // Base cost per piece
				wastage: 10,
				totalPrice: 256, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Construction Sealant",
				description: "Construction grade sealant for waterproofing connections",
				type: "material",
				category: "constructionMaterials",
				quantity: 10, // tubes
				price: 8.5, // Base cost per tube
				wastage: 10,
				totalPrice: 85, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Construction Screws",
				description: "Assorted construction screws for assembly",
				type: "material",
				category: "constructionMaterials",
				quantity: 5, // boxes
				price: 24, // Base cost per box
				wastage: 10,
				totalPrice: 120, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Installation Requirements",
				description: "System must be installed by MST Authorized Installer with maintenance agreement",
				type: "material",
				category: "subcontractor",
				quantity: 1,
				price: 0, // No cost listed in quote
				totalPrice: 0, // No markup needed
			},
			{
				id: crypto.randomUUID(),
				name: "Network Connection",
				description: "Contractor must supply terminated network cable to MST Panel",
				type: "material",
				category: "electrical",
				quantity: 1,
				price: 0, // No cost listed in quote
				totalPrice: 0, // No markup needed
			},
		];
	},
};

export default EnviroServerES450Config;
