export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-200 text-sm">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="hover:underline cursor-pointer">Help Centre</li>
              <li className="hover:underline cursor-pointer">AirCover</li>
              <li className="hover:underline cursor-pointer">Anti-discrimination</li>
              <li className="hover:underline cursor-pointer">Disability support</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Hosting</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="hover:underline cursor-pointer">Airbnb your home</li>
              <li className="hover:underline cursor-pointer">AirCover for Hosts</li>
              <li className="hover:underline cursor-pointer">Hosting resources</li>
              <li className="hover:underline cursor-pointer">Community forum</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Airbnb</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="hover:underline cursor-pointer">Newsroom</li>
              <li className="hover:underline cursor-pointer">New features</li>
              <li className="hover:underline cursor-pointer">Careers</li>
              <li className="hover:underline cursor-pointer">Investors</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Inspiration</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="hover:underline cursor-pointer">Popular getaways</li>
              <li className="hover:underline cursor-pointer">Beach house rentals</li>
              <li className="hover:underline cursor-pointer">Mountain cabins</li>
              <li className="hover:underline cursor-pointer">Villa retreats</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <div>
            © 2026 Airbnb Clone, Inc. · Privacy · Terms · Sitemap · Company details
          </div>
          <div className="flex items-center space-x-4 font-semibold text-gray-800">
            <span>English (IN)</span>
            <span>INR (₹)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
