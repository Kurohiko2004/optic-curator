{
"totalItems": 25,          // Tổng số lượng kính trong DB thỏa mãn điều kiện lọc
"data": [                  // Danh sách các sản phẩm kính
{
"id": 1,
"name": "Lumina Horizon",
"description": "Premium acetate frames...",
"price": "299.00",
"stock": 15,
"materialFrame": "Titanium",     // <-- Trường chất liệu gọng kính
"lensType": "Polarized",        // <-- Trường loại mắt kính
"glassShapeId": 2,
"shape": {             // Thông tin hình dáng (được join từ bảng GlassesShape)
"id": 2,
"name": "Round"
},
"colors": [            // Danh sách màu sắc (được join từ bảng Color)
{ "id": 1, "name": "Obsidian Black" },
{ "id": 3, "name": "Rose Gold" }
]
},
...
],
"totalPages": 3,           // Tổng số trang dựa trên 'items'
"currentPage": 1           // Trang hiện tại
}