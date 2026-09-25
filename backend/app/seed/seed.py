from datetime import date, timedelta, datetime, timezone
import random
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.amenity import Amenity, ListingAmenity
from app.models.listing import Listing, ListingImage
from app.models.booking import Booking
from app.models.review import Review
from app.models.wishlist import Wishlist

# Stock High Quality Unsplash Images grouped by category
IMAGE_POOLS = {
    "Villas": [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    ],
    "Apartments": [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    ],
    "Cabins": [
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    ],
    "Pools": [
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80",
    ]
}

def seed_db(db: Session) -> dict:
    Base.metadata.create_all(bind=engine)

    if db.query(User).first() is not None:
        return {
            "status": "already_seeded",
            "user_count": db.query(User).count(),
            "listing_count": db.query(Listing).count(),
            "amenity_count": db.query(Amenity).count(),
            "image_count": db.query(ListingImage).count(),
            "booking_count": db.query(Booking).count(),
            "review_count": db.query(Review).count(),
            "wishlist_count": db.query(Wishlist).count(),
        }

    # 1. USERS (6 Hosts, 4 Guests)
    users_data = [
        {"name": "Aarav Sharma", "email": "aarav.sharma@example.com", "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400", "is_host": True, "is_superhost": True},
        {"name": "Priya Patel", "email": "priya.patel@example.com", "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400", "is_host": True, "is_superhost": True},
        {"name": "Rohan Mehta", "email": "rohan.mehta@example.com", "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", "is_host": True, "is_superhost": False},
        {"name": "Ananya Deshmukh", "email": "ananya.d@example.com", "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400", "is_host": True, "is_superhost": True},
        {"name": "Vikram Malhotra", "email": "vikram.m@example.com", "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", "is_host": True, "is_superhost": False},
        {"name": "Sneha Rao", "email": "sneha.rao@example.com", "avatar_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400", "is_host": True, "is_superhost": True},
        {"name": "Demo Guest", "email": "demo.guest@example.com", "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400", "is_host": False, "is_superhost": False},
        {"name": "Kabir Verma", "email": "kabir.verma@example.com", "avatar_url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400", "is_host": False, "is_superhost": False},
        {"name": "Diya Kapoor", "email": "diya.k@example.com", "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400", "is_host": False, "is_superhost": False},
        {"name": "Rahul Roy", "email": "rahul.roy@example.com", "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400", "is_host": False, "is_superhost": False},
    ]

    users = []
    for u_data in users_data:
        user = User(**u_data)
        db.add(user)
        users.append(user)
    db.flush()

    hosts = [u for u in users if u.is_host]
    guests = [u for u in users if not u.is_host]
    demo_guest = next(u for u in guests if u.email == "demo.guest@example.com")

    # 2. AMENITIES (20 items)
    amenities_list = [
        ("Wifi", "wifi"),
        ("Kitchen", "utensils"),
        ("Air conditioning", "snowflake"),
        ("Pool", "waves"),
        ("Free parking", "car"),
        ("Dedicated workspace", "laptop"),
        ("Washer", "shirt"),
        ("Dryer", "wind"),
        ("TV", "tv"),
        ("Heating", "flame"),
        ("Balcony", "sun"),
        ("Garden", "tree"),
        ("BBQ grill", "fire"),
        ("Pets allowed", "dog"),
        ("Hot tub", "hot-tub"),
        ("Breakfast", "coffee"),
        ("Beach access", "umbrella-beach"),
        ("Mountain view", "mountain"),
        ("Smoke alarm", "bell"),
        ("First aid kit", "medkit"),
    ]

    amenities = []
    for name, icon in amenities_list:
        amenity = Amenity(name=name, icon=icon)
        db.add(amenity)
        amenities.append(amenity)
    db.flush()

    # 3. 35 DETAILED LISTINGS
    # Format: (title, description, property_type, category, city, country, price_per_night, cleaning_fee, max_guests, bedrooms, beds, bathrooms)
    raw_listings_data = [
        ("Luxury Beachfront Villa in Sainik Farm", "Stunning luxury villa right next to the beach with private pool, tropical garden, and full sunset views.", "Villa", "Beachfront", "North Goa", "India", 18500, 1500, 8, 4, 4, 4.5),
        ("Heritage Portuguese Flat in Malviya Nagar", "Charming heritage flat with modern amenities in quiet Portuguese quarter of Goa.", "Apartment", "Trending", "Panaji", "India", 6500, 600, 4, 2, 2, 2.0),
        ("Modern Sea View Villa in Arpora", "Spacious villa with infinity pool, rooftop terrace and lush palm surround.", "Villa", "Pools", "Arpora", "India", 22000, 2000, 10, 5, 5, 5.0),
        ("Cozy Studio in Siolim", "Sunlit studio flat with private balcony and jungle garden view.", "Apartment", "Apartments", "Siolim", "India", 4200, 400, 2, 1, 1, 1.0),
        ("Beachside Cottage in Vagator", "Charming wooden cottage just 2 minutes walk from Vagator cliff beach.", "Cottage", "Beachfront", "Vagator", "India", 7500, 800, 4, 2, 2, 1.5),
        ("Sea Facing Penthouse in Bandra", "Ultra-luxurious sea facing penthouse with floor to ceiling glass windows.", "Apartment", "Amazing views", "Mumbai", "India", 19000, 1800, 6, 3, 3, 3.5),
        ("Boho Chic Flat in Colaba", "Stylish heritage studio in prime South Mumbai location near Gateway of India.", "Apartment", "Trending", "Mumbai", "India", 8200, 700, 3, 1, 2, 1.0),
        ("Luxury Apartment in Juhu", "Modern apartment close to Juhu beach with premium amenities and gym access.", "Apartment", "Apartments", "Mumbai", "India", 12500, 1200, 5, 2, 3, 2.0),
        ("Architectural Loft in Hauz Khas Village", "Designer loft apartment with lake view balcony overlooking historic monuments.", "Apartment", "Amazing views", "Delhi", "India", 9500, 900, 4, 2, 2, 2.0),
        ("Peaceful Villa in Sainik Farm", "Expansive green farm villa in South Delhi with private lawn and tennis court.", "Villa", "Countryside", "Delhi", "India", 24000, 2500, 12, 6, 6, 6.0),
        ("Modern Studio in Saket", "Sleek studio apartment close to metro station and top shopping malls.", "Apartment", "Apartments", "Delhi", "India", 3800, 350, 2, 1, 1, 1.0),
        ("Royal Heritage Haveli in Jaipur", "Authentic Rajasthani Haveli with courtyard pool and regal architecture.", "House", "Trending", "Jaipur", "India", 14000, 1200, 8, 4, 4, 4.0),
        ("Lake View Suite in Udaipur", "Romantic suite overlooking Lake Pichola with rooftop dining terrace.", "Apartment", "Amazing views", "Udaipur", "India", 11000, 1000, 3, 1, 2, 1.5),
        ("Pink City Courtyard Villa", "Quiet luxury villa in central Jaipur featuring traditional arches and gardens.", "Villa", "Villas", "Jaipur", "India", 16500, 1500, 8, 4, 4, 4.5),
        ("Alpine Wooden Chalet in Manali", "Cozy wooden cabin nestled in pine forest with panoramic snow mountain views.", "Cabin", "Cabins", "Manali", "India", 9800, 800, 6, 3, 3, 2.5),
        ("Mountain Edge Cottage in Mussoorie", "Peaceful cottage perched on cliff side with valley sunrise views.", "Cottage", "Mountain view", "Mussoorie", "India", 8500, 700, 5, 2, 3, 2.0),
        ("Green Hills Farm Stay in Dehradun", "Sprawling organic farm stay surrounded by lychee orchards and hills.", "Farm stay", "Countryside", "Dehradun", "India", 6800, 600, 6, 3, 3, 2.0),
        ("High Peak Cabin in Solang Valley", "Remote luxury cabin with private fireplace and hot tub in snow mountains.", "Cabin", "Cabins", "Manali", "India", 14500, 1200, 4, 2, 2, 2.0),
        ("Infinity Pool Villa in Lonavala", "Modern 4-bedroom villa with private heated pool and fog valley views.", "Villa", "Pools", "Lonavala", "India", 21000, 2000, 12, 4, 5, 4.5),
        ("Hilltop Glass House in Lonavala", "Glass walled sanctuary offering 360-degree monsoon valley views.", "House", "Amazing views", "Lonavala", "India", 17500, 1600, 8, 3, 4, 3.5),
        ("Serene Nature Retreat in Khandala", "Peaceful cottage with lush garden lawn, waterfall access and deck.", "Cottage", "Countryside", "Lonavala", "India", 9200, 850, 6, 2, 3, 2.0),
        ("Penthouse Loft in Indiranagar", "Contemporary penthouse with private garden deck in Bangalore's food hub.", "Apartment", "Trending", "Bengaluru", "India", 8900, 800, 4, 2, 2, 2.0),
        ("Garden Villa in Sadashivnagar", "Spacious heritage bungalow surrounded by botanical gardens.", "Villa", "Villas", "Bengaluru", "India", 18000, 1500, 8, 4, 4, 4.0),
        ("Ghat View Heritage Home in Varanasi", "Traditional house with private terrace looking over the sacred Ganges river.", "House", "Amazing views", "Varanasi", "India", 5500, 500, 4, 2, 2, 2.0),
        ("Tiny House on Cliffside", "Compact eco-friendly tiny home built on scenic hillside with starry night skies.", "Tiny home", "Tiny homes", "Mussoorie", "India", 4800, 450, 2, 1, 1, 1.0),
        ("Luxury Pool Resort Villa in Candolim", "Grand resort villa with private pool, butler service and garden.", "Villa", "Pools", "Candolim", "India", 28000, 2500, 10, 5, 5, 5.0),
        ("Penthouse Lake Apartment in Udaipur", "Spacious lakefront penthouse with private Jacuzzi deck.", "Apartment", "Amazing views", "Udaipur", "India", 15500, 1400, 6, 3, 3, 3.0),
        ("Pine Forest Wooden Hut", "Secluded wooden cabin surrounded by tall pine trees and hiking trails.", "Cabin", "Cabins", "Manali", "India", 5200, 500, 3, 1, 2, 1.0),
        ("Artistic Flat in Khar West", "Minimalist aesthetic apartment with balcony garden in central Mumbai.", "Apartment", "Apartments", "Mumbai", "India", 9800, 900, 4, 2, 2, 1.5),
        ("Vintage Farm Stay in Alibaug", "Organic coconut grove farm stay near quiet beach.", "Farm stay", "Countryside", "Alibaug", "India", 11500, 1000, 8, 3, 4, 3.0),
        ("Royal Desert Camp Villa", "Luxury glamping villa with desert safari views and traditional music.", "Villa", "Countryside", "Jaipur", "India", 13500, 1100, 4, 2, 2, 2.0),
        ("Minimalist Loft in Koramangala", "Smart loft apartment with high speed fiber internet and coffee machine.", "Apartment", "Apartments", "Bengaluru", "India", 4600, 400, 2, 1, 1, 1.0),
        ("Sunset Point Villa in Anjuna", "Vibrant tropical villa with outdoor pool bar and sound system.", "Villa", "Beachfront", "Anjuna", "India", 24500, 2200, 10, 4, 5, 4.0),
        ("Riverside Cottage in Rishikesh", "Tranquil retreat right on the bank of the Ganges with yoga lawn.", "Cottage", "Countryside", "Dehradun", "India", 7200, 650, 4, 2, 2, 2.0),
        ("Valley View Chalet in Shimla", "Colonial style wooden chalet with fireplace and valley views.", "House", "Amazing views", "Manali", "India", 12800, 1100, 6, 3, 3, 3.0),
    ]

    listings = []
    for i, data in enumerate(raw_listings_data):
        host = hosts[i % len(hosts)]
        title, desc, p_type, cat, city, country, price, clean_fee, max_g, bedr, beds, bath = data
        
        listing = Listing(
            host_id=host.id,
            title=title,
            description=desc,
            property_type=p_type,
            category=cat,
            city=city,
            country=country,
            latitude=15.2993 + (i * 0.1),
            longitude=74.1240 + (i * 0.1),
            price_per_night=float(price),
            cleaning_fee=float(clean_fee),
            max_guests=max_g,
            bedrooms=bedr,
            beds=beds,
            bathrooms=bath
        )
        db.add(listing)
        listings.append(listing)
    db.flush()

    # 4. LISTING IMAGES (5 images per listing) & AMENITIES
    for listing in listings:
        category_key = listing.category if listing.category in IMAGE_POOLS else "Villas"
        pool = IMAGE_POOLS[category_key]
        
        for pos in range(5):
            # Offset each listing's stable image set so neighboring homes do not share the same cover.
            img_url = pool[(pos + listing.id - 1) % len(pool)]
            img = ListingImage(listing_id=listing.id, url=img_url, position=pos)
            db.add(img)
            
        random.seed(listing.id)
        selected_amenities = random.sample(amenities, k=random.randint(6, 12))
        for amen in selected_amenities:
            db.add(ListingAmenity(listing_id=listing.id, amenity_id=amen.id))

    db.flush()

    # 5. BOOKINGS (Past and Future)
    bookings = []
    today = date.today()

    # Past bookings (12 bookings)
    for i in range(12):
        listing = listings[i % len(listings)]
        guest = guests[i % len(guests)]
        check_in = today - timedelta(days=60 - (i * 4))
        check_out = check_in + timedelta(days=3)
        nights = 3
        nightly_price = listing.price_per_night
        cleaning_fee = listing.cleaning_fee
        service_fee = round(nightly_price * nights * 0.12, 2)
        total_price = (nightly_price * nights) + cleaning_fee + service_fee

        booking = Booking(
            listing_id=listing.id,
            guest_id=guest.id,
            check_in=check_in,
            check_out=check_out,
            guests=min(2, listing.max_guests),
            nightly_price=nightly_price,
            nights=nights,
            cleaning_fee=cleaning_fee,
            service_fee=service_fee,
            total_price=total_price,
            status="confirmed"
        )
        db.add(booking)
        bookings.append(booking)

    # Future bookings (10 bookings to block dates)
    for i in range(10):
        listing = listings[(i + 5) % len(listings)]
        guest = guests[(i + 1) % len(guests)]
        check_in = today + timedelta(days=10 + (i * 5))
        check_out = check_in + timedelta(days=4)
        nights = 4
        nightly_price = listing.price_per_night
        cleaning_fee = listing.cleaning_fee
        service_fee = round(nightly_price * nights * 0.12, 2)
        total_price = (nightly_price * nights) + cleaning_fee + service_fee

        booking = Booking(
            listing_id=listing.id,
            guest_id=guest.id,
            check_in=check_in,
            check_out=check_out,
            guests=min(3, listing.max_guests),
            nightly_price=nightly_price,
            nights=nights,
            cleaning_fee=cleaning_fee,
            service_fee=service_fee,
            total_price=total_price,
            status="confirmed"
        )
        db.add(booking)
        bookings.append(booking)

    db.flush()

    # 6. REVIEWS (Linked to past bookings)
    sample_comments = [
        "Absolutely amazing stay! The views were breathtaking and host was super responsive.",
        "Beautiful property and clean rooms. Great location near top attractions.",
        "Had a wonderful weekend here with family. Highly recommend this place!",
        "Stunning interior design and peaceful surroundings. Will definitely return.",
        "Good experience overall. Clean amenities and smooth check-in process.",
        "Exceeded all expectations! The pool and terrace view were top notch.",
        "Very comfortable stay. Great hospitality and delicious breakfast.",
    ]

    reviews = []
    for i, booking in enumerate(bookings[:12]):
        rating = random.choice([5, 5, 4, 5, 4, 5, 4])
        comment = sample_comments[i % len(sample_comments)]
        review = Review(
            listing_id=booking.listing_id,
            author_id=booking.guest_id,
            booking_id=booking.id,
            rating=rating,
            comment=comment
        )
        db.add(review)
        reviews.append(review)

    db.flush()

    # 7. WISHLISTS
    wishlists = []
    for i in range(5):
        w = Wishlist(user_id=demo_guest.id, listing_id=listings[i].id)
        db.add(w)
        wishlists.append(w)
    
    kabir = guests[1]
    for i in range(3, 6):
        w = Wishlist(user_id=kabir.id, listing_id=listings[i].id)
        db.add(w)
        wishlists.append(w)

    db.commit()

    return {
        "status": "seeded_successfully",
        "user_count": db.query(User).count(),
        "listing_count": db.query(Listing).count(),
        "amenity_count": db.query(Amenity).count(),
        "image_count": db.query(ListingImage).count(),
        "booking_count": db.query(Booking).count(),
        "review_count": db.query(Review).count(),
        "wishlist_count": db.query(Wishlist).count(),
    }

if __name__ == "__main__":
    db = SessionLocal()
    try:
        res = seed_db(db)
        print("Seed result:", res)
    finally:
        db.close()
