import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Phone, MapPin, Mail, Send, Check, AlertCircle } from 'lucide-react';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    emailConfirm: '',
    phone: '',
    message: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.emailConfirm) {
      errors.emailConfirm = 'Please confirm your email';
    } else if (formData.email !== formData.emailConfirm) {
      errors.emailConfirm = 'Emails do not match';
    }
    if (!formData.message) errors.message = 'Message is required';
    
    return errors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        // Reset form after 5 seconds
        setTimeout(() => {
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            emailConfirm: '',
            phone: '',
            message: ''
          });
          setIsSubmitted(false);
        }, 5000);
      }, 1500);
    } else {
      setFormErrors(errors);
      // Animate to first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementsByName(firstErrorField)[0];
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
    }
  };
  
  const contactInfo = [
    { icon: 'facebook', text: 'cloudx.hosting', url: 'https://facebook.com/cloudx.hosting' },
    { icon: 'instagram', text: '@cloudx.hosting', url: 'https://instagram.com/cloudx.hosting' },
    { icon: 'phone', text: '+91 98765 43210', url: 'tel:+919876543210' },
    { icon: 'map-pin', text: 'Eon IT Park, Kharadi, Pune, Maharashtra 411014, India', url: 'https://maps.google.com/?q=Eon+IT+Park+Kharadi+Pune' },
    { icon: 'mail', text: 'contact@cloudx.hosting', url: 'mailto:contact@cloudx.hosting' }
  ];
  
  const renderIcon = (iconName) => {
    switch(iconName) {
      case 'facebook':
        return <Facebook className="w-6 h-6 text-blue-600" />;
      case 'instagram':
        return <Instagram className="w-6 h-6 text-blue-600" />;
      case 'phone':
        return <Phone className="w-6 h-6 text-blue-600" />;
      case 'map-pin':
        return <MapPin className="w-6 h-6 text-blue-600" />;
      case 'mail':
        return <Mail className="w-6 h-6 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left Column */}
          <div className="lg:w-2/5">
            <h1 className="text-5xl font-bold text-gray-900 mb-8">Get In Touch</h1>
            <p className="text-xl text-gray-700 mb-10 leading-relaxed">
              At CloudX Hosting, we&apos;re committed to providing exceptional service. 
              Whether you have questions about our hosting solutions, need 
              technical support, or want to discuss custom requirements, our 
              team is ready to assist you 24/7.
            </p>
            
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-blue-100 transition-all duration-300 transform hover:translate-x-2"
                >
                  <div className="bg-white p-3 rounded-full shadow-md">
                    {renderIcon(item.icon)}
                  </div>
                  <span className="text-xl text-gray-700">{item.text}</span>
                </a>
              ))}
            </div>
          </div>
          
          <div className="lg:w-3/5 pr-0 lg:pr-12">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              {isSubmitted ? (
                <div className="text-center py-12 px-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">Thank You!</h3>
                  <p className="text-xl text-gray-600">Your message has been sent successfully. We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form className='mr-8' onSubmit={handleSubmit}>
                  <h2 className="text-3xl font-bold text-gray-800 mb-8">Send Us a Message</h2>
                  
                  <div className="mb-8 ">
                    <label className="block text-gray-700 text-lg font-medium mb-3">Full Name</label>
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-1 mr-6">
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('firstName')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="First Name"
                          className={`w-full px-4 py-3 text-lg rounded-lg border ${
                            formErrors.firstName ? 'border-red-500' : 
                            focusedField === 'firstName' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                          } focus:outline-none transition-all duration-300`}
                        />
                        {formErrors.firstName && (
                          <div className="flex items-center mt-2 text-red-500">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            <p className="text-sm">{formErrors.firstName}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('lastName')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Last Name"
                          className={`w-full px-4 py-3 text-lg rounded-lg border ${
                            formErrors.lastName ? 'border-red-500' : 
                            focusedField === 'lastName' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                          } focus:outline-none transition-all duration-300`}
                        />
                        {formErrors.lastName && (
                          <div className="flex items-center mt-2 text-red-500">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            <p className="text-sm">{formErrors.lastName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <label className="block text-gray-700 text-lg font-medium mb-3">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="your@email.com"
                      className={`w-full px-4 py-3 text-lg rounded-lg border ${
                        formErrors.email ? 'border-red-500' : 
                        focusedField === 'email' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                      } focus:outline-none transition-all duration-300`}
                    />
                    {formErrors.email && (
                      <div className="flex items-center mt-2 text-red-500">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        <p className="text-sm">{formErrors.email}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-8">
                    <label className="block text-gray-700 text-lg font-medium mb-3">Confirm Email</label>
                    <input
                      type="email"
                      name="emailConfirm"
                      value={formData.emailConfirm}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('emailConfirm')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Confirm your email"
                      className={`w-full px-4 py-3 text-lg rounded-lg border ${
                        formErrors.emailConfirm ? 'border-red-500' : 
                        focusedField === 'emailConfirm' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                      } focus:outline-none transition-all duration-300`}
                    />
                    {formErrors.emailConfirm && (
                      <div className="flex items-center mt-2 text-red-500">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        <p className="text-sm">{formErrors.emailConfirm}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-8">
                    <label className="block text-gray-700 text-lg font-medium mb-3">Phone (optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="+91 98765-43210"
                      className={`w-full px-4 py-3 text-lg rounded-lg border ${
                        focusedField === 'phone' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                      } focus:outline-none transition-all duration-300`}
                    />
                  </div>
                  
                  <div className="mb-10">
                    <label className="block text-gray-700 text-lg font-medium mb-3">Your Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="How can we help you today?"
                      rows="5"
                      className={`w-full px-4 py-3 text-lg rounded-lg border ${
                        formErrors.message ? 'border-red-500' : 
                        focusedField === 'message' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                      } focus:outline-none transition-all duration-300`}
                    ></textarea>
                    {formErrors.message && (
                      <div className="flex items-center mt-2 text-red-500">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        <p className="text-sm">{formErrors.message}</p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium py-4 px-6 rounded-lg transition-all duration-300 transform hover:translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Message...
                      </span>
                    ) : (
                      <span className="inline-flex items-center">
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;