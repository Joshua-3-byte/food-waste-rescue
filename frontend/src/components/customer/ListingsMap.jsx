// frontend/src/components/customer/ListingsMap.jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

// Fix Leaflet default marker icon issue with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ListingsMap = ({ listings }) => {
  const navigate = useNavigate();

  // Default center - Nairobi, Kenya
  const defaultCenter = [-1.2921, 36.8219];
  const defaultZoom = 12;

  // Filter listings that have valid coordinates
  const listingsWithCoords = listings.filter(
    listing => 
      listing.restaurantId?.address?.coordinates?.lat && 
      listing.restaurantId?.address?.coordinates?.lng
  );

  console.log('Listings with coordinates:', listingsWithCoords.length);

  if (listingsWithCoords.length === 0) {
    return (
      <div className="h-full min-h-[500px] flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No locations to display</h3>
          <p className="text-gray-600 mb-2">
            Restaurants haven't added their location coordinates yet.
          </p>
          <p className="text-sm text-gray-500">
            Switch to List View to see available listings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[500px] rounded-lg overflow-hidden border border-gray-300 shadow-lg">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full"
        style={{ minHeight: '500px', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {listingsWithCoords.map((listing) => {
          const lat = listing.restaurantId.address.coordinates.lat;
          const lng = listing.restaurantId.address.coordinates.lng;

          return (
            <Marker
              key={listing._id}
              position={[lat, lng]}
            >
              <Popup maxWidth={250}>
                <div className="p-2">
                  {/* Image */}
                  {listing.images && listing.images.length > 0 && (
                    <img
                      src={listing.images[0].url}
                      alt={listing.title}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}

                  {/* Title */}
                  <h3 className="font-bold text-sm mb-1 text-gray-900">
                    {listing.title}
                  </h3>

                  {/* Restaurant Name */}
                  <p className="text-xs text-gray-600 mb-2">
                    {listing.restaurantId.businessName}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {listing.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-primary font-bold text-lg">
                        KES {listing.discountedPrice}
                      </span>
                      <span className="text-xs text-gray-500 line-through ml-1">
                        KES {listing.originalPrice}
                      </span>
                    </div>
                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded font-bold">
                      {listing.discountPercentage}% OFF
                    </span>
                  </div>

                  {/* Quantity */}
                  <p className="text-xs text-gray-600 mb-3">
                    {listing.quantityRemaining} items left
                  </p>

                  {/* View Button */}
                  <button
                    onClick={() => navigate(`/listings/${listing._id}`)}
                    className="w-full bg-primary text-white text-xs py-2 rounded hover:bg-green-600 font-medium transition"
                  >
                    View Details →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ListingsMap;