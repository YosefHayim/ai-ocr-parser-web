import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // REPLACE THIS with your actual email address
  const myEmail = "yosefisabag@gmail.com";

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between bg-black p-8 text-center text-white">
        <div className="flex w-full items-center justify-center gap-2">
          <p className="text-sm">© {currentYear} Yosef Hayim. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${myEmail}`} target="_blank" rel="noopener noreferrer" title="Send me an email">
              <FaEnvelope size={20} className="cursor-pointer hover:text-gray-400" />
            </a>

            <a href="https://www.linkedin.com/in/yosef-hayim-sabag/" target="_blank" rel="noopener noreferrer">
              <FaLinkedin size={20} className="cursor-pointer hover:text-gray-400" />
            </a>

            <a href="https://github.com/YosefHayim" target="_blank" rel="noopener noreferrer">
              <FaGithub size={20} className="cursor-pointer hover:text-gray-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
