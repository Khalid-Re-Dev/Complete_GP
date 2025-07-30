# Script to add products to stores
$baseUrl = "http://localhost:8000/api"

# Store IDs and names
$stores = @(
    @{id=133; name="Collins PLC"},
    @{id=129; name="Crawford and Sons"},
    @{id=131; name="Raymond, Simpson and Davis"},
    @{id=130; name="Wilkerson Group"},
    @{id=136; name="آل حسين-بيشان"},
    @{id=127; name="آل رفيع and Sons"},
    @{id=137; name="الجابر-الخير-افي"},
    @{id=134; name="الهيدال-آل بن طاهر"},
    @{id=132; name="بن لادن-آل بن عطيه"},
    @{id=128; name="حنيولي Group"},
    @{id=135; name="حنيولي-أبا الخيل"}
)

# Categories and Brands
$categories = @(
    @{id=14; name="Electronics"},
    @{id=15; name="Clothing"},
    @{id=16; name="Home & Garden"},
    @{id=17; name="Sports & Outdoors"},
    @{id=18; name="Books"},
    @{id=19; name="Health & Beauty"}
)

$brands = @(
    @{id=13; name="TechCorp"},
    @{id=14; name="FashionPlus"},
    @{id=15; name="HomeStyle"},
    @{id=16; name="SportMax"},
    @{id=17; name="BookWorld"},
    @{id=18; name="BeautyLux"},
    @{id=1; name="سامسونج"},
    @{id=2; name="آبل"},
    @{id=3; name="هواوي"}
)

# Product templates for each category
$productTemplates = @{
    14 = @( # Electronics
        @{name="Smartphone Pro Max"; description="Latest flagship smartphone with advanced features"; price=899.99},
        @{name="Wireless Headphones"; description="Premium noise-canceling wireless headphones"; price=299.99},
        @{name="4K Smart TV"; description="Ultra HD Smart TV with streaming capabilities"; price=1299.99},
        @{name="Gaming Laptop"; description="High-performance gaming laptop with RTX graphics"; price=1899.99},
        @{name="Tablet Pro"; description="Professional tablet for work and creativity"; price=799.99}
    )
    15 = @( # Clothing
        @{name="Premium Cotton T-Shirt"; description="Comfortable premium cotton t-shirt"; price=29.99},
        @{name="Designer Jeans"; description="Stylish designer jeans with perfect fit"; price=89.99},
        @{name="Winter Jacket"; description="Warm and stylish winter jacket"; price=159.99},
        @{name="Running Shoes"; description="Professional running shoes for athletes"; price=129.99},
        @{name="Casual Dress"; description="Elegant casual dress for any occasion"; price=79.99}
    )
    16 = @( # Home & Garden
        @{name="Smart Home Hub"; description="Central control for all smart home devices"; price=199.99},
        @{name="Garden Tool Set"; description="Complete set of professional garden tools"; price=149.99},
        @{name="LED Desk Lamp"; description="Adjustable LED desk lamp with USB charging"; price=59.99},
        @{name="Kitchen Blender"; description="High-power kitchen blender for smoothies"; price=119.99},
        @{name="Decorative Plant Pot"; description="Beautiful ceramic plant pot for home decor"; price=39.99}
    )
    17 = @( # Sports & Outdoors
        @{name="Professional Tennis Racket"; description="High-quality tennis racket for professionals"; price=249.99},
        @{name="Camping Tent"; description="Waterproof camping tent for 4 people"; price=199.99},
        @{name="Fitness Tracker"; description="Advanced fitness tracker with heart rate monitor"; price=179.99},
        @{name="Yoga Mat"; description="Premium non-slip yoga mat"; price=49.99},
        @{name="Mountain Bike"; description="Professional mountain bike for trails"; price=899.99}
    )
    18 = @( # Books
        @{name="Programming Guide"; description="Complete guide to modern programming"; price=49.99},
        @{name="Business Strategy Book"; description="Essential business strategy and management"; price=34.99},
        @{name="Cooking Masterclass"; description="Professional cooking techniques and recipes"; price=39.99},
        @{name="Photography Handbook"; description="Complete guide to digital photography"; price=44.99},
        @{name="Language Learning Set"; description="Complete language learning course"; price=59.99}
    )
    19 = @( # Health & Beauty
        @{name="Skincare Set"; description="Complete skincare routine for healthy skin"; price=89.99},
        @{name="Hair Styling Tool"; description="Professional hair styling and care tool"; price=129.99},
        @{name="Vitamin Supplements"; description="Essential daily vitamin supplements"; price=29.99},
        @{name="Massage Device"; description="Therapeutic massage device for relaxation"; price=199.99},
        @{name="Aromatherapy Diffuser"; description="Essential oil diffuser for wellness"; price=69.99}
    )
}

Write-Host "🚀 Starting to add products to stores..." -ForegroundColor Green

$totalProducts = 0

foreach ($store in $stores) {
    Write-Host "🏪 Adding products to store: $($store.name) (ID: $($store.id))" -ForegroundColor Cyan
    
    # Add 5 products per store from different categories
    $categoryKeys = $productTemplates.Keys | Get-Random -Count 5
    
    foreach ($categoryId in $categoryKeys) {
        $category = $categories | Where-Object {$_.id -eq $categoryId}
        $brand = $brands | Get-Random
        $template = $productTemplates[$categoryId] | Get-Random
        
        $productData = @{
            name = "$($template.name) - $($store.name)"
            description = $template.description
            price = $template.price
            category = $categoryId
            brand = $brand.id
            store = $store.id
            stock = Get-Random -Minimum 10 -Maximum 100
            is_active = $true
            image_urls = @("https://picsum.photos/400/400?random=$((Get-Random -Minimum 1000 -Maximum 9999))")
        }
        
        try {
            $jsonData = $productData | ConvertTo-Json -Depth 3
            Write-Host "📦 Creating product: $($productData.name)" -ForegroundColor Yellow
            
            $response = Invoke-RestMethod -Uri "$baseUrl/products/create/" -Method POST -Body $jsonData -ContentType "application/json"
            Write-Host "✅ Product created successfully: ID $($response.id)" -ForegroundColor Green
            $totalProducts++
            
            Start-Sleep -Milliseconds 500  # Small delay to avoid overwhelming the server
        }
        catch {
            Write-Host "❌ Failed to create product: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "✅ Completed store: $($store.name)" -ForegroundColor Green
    Write-Host "---" -ForegroundColor Gray
}

Write-Host "🎉 Finished! Total products created: $totalProducts" -ForegroundColor Green
Write-Host "🔄 You can now test the store filter on the frontend!" -ForegroundColor Cyan