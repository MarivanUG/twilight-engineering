import { useState } from 'react';
import type { AppSettings } from '../../types';
import { Mail, Phone, MapPin, Loader2, Send } from 'lucide-react';
import { sendMessage } from '../../lib/firestoreService';

interface ContactContentProps {
  settings: AppSettings;
}

export const ContactContent: React.FC<ContactContentProps> = ({ settings }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const fullMessage = `Name: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\nMessage: ${formData.message}`;
      await sendMessage({ from: `${formData.firstName} ${formData.lastName} (${formData.email})`, text: fullMessage });
      setSuccess(true);
      setFormData({ firstName: '', lastName: '', email: '', message: '' }); // Clear form
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send your message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white py-20 px-4 min-h-[80vh] animate-fade-in">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
        <div>
          <h2 className="text-4xl font-bold mb-6">Get In Touch</h2>
          <div className="space-y-8">
            {settings.address && (
              <div className="flex items-start">
                <MapPin className="w-6 h-6 mr-6 text-orange-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-xl mb-1">Visit Us</h4>
                  <p className="text-gray-400">{settings.address}</p>
                </div>
              </div>
            )}
            {settings.phoneNumber && (
              <div className="flex items-start">
                <Phone className="w-6 h-6 mr-6 text-orange-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-xl mb-1">Call Us</h4>
                  <p className="text-gray-400">{settings.phoneNumber}</p>
                </div>
              </div>
            )}
            {settings.supportEmail && (
              <div className="flex items-start">
                <Mail className="w-6 h-6 mr-6 text-orange-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-xl mb-1">Email Us</h4>
                  <p className="text-gray-400">{settings.supportEmail}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-8 text-slate-800 shadow-2xl">
          <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border rounded-lg p-3 outline-none focus:border-orange-500"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border rounded-lg p-3 outline-none focus:border-orange-500"
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-slate-50 border rounded-lg p-3 outline-none focus:border-orange-500"
            />
            <textarea
              rows={4}
              name="message"
              placeholder="Your Message..."
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full bg-slate-50 border rounded-lg p-3 outline-none focus:border-orange-500"
            ></textarea>
            <button
              type="submit"
              className="w-full bg-orange-600 text-white font-bold py-4 rounded-lg hover:bg-orange-700 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : (
                <Send className="mr-2" size={20} />
              )}
              {loading ? 'Sending...' : 'Send Message'}
            </button>

            {success && (
              <p className="mt-4 text-green-600 text-center">Your message has been sent successfully!</p>
            )}
            {error && (
              <p className="mt-4 text-red-600 text-center">{error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};