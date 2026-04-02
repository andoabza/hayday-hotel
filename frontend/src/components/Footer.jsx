const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Hayday Hotel. All rights reserved.</p>
        <p className="mt-2">Bole Road, Addis Ababa, Ethiopia | +251 911 123456</p>
      </div>
    </footer>
  );
};

export default Footer;