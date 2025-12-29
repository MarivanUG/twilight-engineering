import React, { useState, useEffect } from 'react';
import type { Message } from '../../types';
import { getMessages, deleteMessage, markNotificationReadByRef } from '../../lib/firestoreService';
import { Mail, Trash2, Eye, XCircle } from 'lucide-react';
import { format } from 'date-fns'; // Assuming date-fns is installed or a similar utility is available

const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [viewingMessage, setViewingMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedMessages = await getMessages();
      setMessages(fetchedMessages as Message[]);
    } catch (err) {
      setError('Failed to fetch messages.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      setLoading(true);
      setError('');
      try {
        await deleteMessage(id);
        fetchMessages();
      } catch (err) {
        setError('Failed to delete message.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewMessage = async (message: Message) => {
    setViewingMessage(message);
    // Mark notification as read if message is viewed
    if (message.id) { // Assuming message.id is the refId for notifications
      try {
        await markNotificationReadByRef(message.id);
        fetchMessages(); // Refresh messages to update read status
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Manage Messages</h2>

      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Messages List */}
      <h3 className="text-xl font-semibold mb-4">Inbox</h3>
      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-slate-500">No messages found.</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex items-center justify-between p-3 border rounded-md bg-white">
              <div className="flex items-center space-x-3">
                <Mail size={24} className="text-blue-500" />
                <div>
                  <p className="font-semibold text-slate-800">{message.from}</p>
                  <p className="text-sm text-slate-600 line-clamp-1">{message.text}</p>
                  <p className="text-xs text-slate-400">{format(message.createdAt, 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleViewMessage(message)} className="p-2 text-blue-500 hover:text-blue-700">
                  <Eye size={18} /> View
                </button>
                <button onClick={() => handleDeleteMessage(message.id)} className="p-2 text-red-500 hover:text-red-700">
                  <Trash2 size={18} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Viewer Modal */}
      {viewingMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
          <div className="bg-white p-8 rounded-lg shadow-xl relative max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Message Details</h2>
            <p className="mb-2"><span className="font-semibold">From:</span> {viewingMessage.from}</p>
            <p className="mb-2"><span className="font-semibold">Received:</span> {format(viewingMessage.createdAt, 'MMM dd, yyyy HH:mm')}</p>
            <div className="mt-4 p-4 border rounded-md bg-slate-50 text-slate-800 whitespace-pre-wrap">
              {viewingMessage.text}
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setViewingMessage(null)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 flex items-center"
              >
                <XCircle size={18} className="mr-2" /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;