
import React from 'react'
import { useForm } from 'react-hook-form'
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md'
import { FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { useMutation } from '@tanstack/react-query'
import { contactMail } from '../api/userApi'
import Swal from 'sweetalert2'

const ContactUs = () => {
  document.title = 'Contact Us | DealStreetJournal'

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const mutation = useMutation({
    mutationFn: contactMail,
    onSuccess: (data) => {
      reset()
      Swal.fire({
        title: 'Success!',
        text: data,
        icon: 'success',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
    },
    onError: (error) => {
      console.error('not send mail', error)
      Swal.fire({
        title: 'Error!',
        text: 'Mail not send try after sometime',
        icon: 'error',
        confirmButtonColor: '#ff7010',
        confirmButtonText: 'Ok',
        timer: 3000,
      })
    },
  })

  const onSubmit = (data) => {
    const contact = {
      fullName: data.fullName,
      mobile: data.mobile,
      email: data.email,
      subject: data.subject,
      message: data.message,
    }
    mutation.mutate(contact)
  }

  return (
    <>
      <div className="w-full bg-slate-50 py-10">
        <div className="max-w-6xl mx-auto w-[90%] overflow-clip border shadow-xl grid grid-cols-1 md:grid-cols-[60%_40%] lg:grid-cols-[70%_30%] rounded-md">
          {/* send mail */}
          <div className="order-last md:order-none p-6">
            <h1 className="font-aptos-bold text-2xl sm:text-3xl">
              Get in Touch
            </h1>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-2 gap-5 mt-5"
            >
              {/* Full Name */}
              <div className="font-aptos-regular flex flex-col gap-1 col-span-2 md:col-span-1">
                <label>Full Name</label>
                <input
                  type="text"
                  {...register('fullName', {
                    required: 'Full Name is required',
                  })}
                  className="border-2 border-gray-300 rounded-md p-1.5"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Mobile No. */}
              <div className="font-aptos-regular flex flex-col gap-1 col-span-2 md:col-span-1">
                <label>Mobile No.</label>
                <input
                  type="number"
                  {...register('mobile', {
                    required: 'Mobile number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Enter a valid 10-digit number',
                    },
                  })}
                  className="border-2 border-gray-300 rounded-md p-1.5"
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm">
                    {errors.mobile.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="font-aptos-regular flex flex-col gap-1 col-span-2">
                <label>Email Address</label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Enter a valid email address',
                    },
                  })}
                  className="border-2 border-gray-300 rounded-md p-1.5"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Subject */}
              <div className="font-aptos-regular flex flex-col gap-1 col-span-2">
                <label>Subject</label>
                <select
                  {...register('subject', { required: 'Subject is required' })}
                  className="border-2 border-gray-300 rounded-md p-1.5"
                >
                  <option value="">Select Subject</option>
                  <option>Investor</option>
                  <option>Founder</option>
                  <option>Support</option>
                  <option>Advertising</option>
                  <option>Customise Report</option>
                </select>
                {errors.subject && (
                  <p className="text-red-500 text-sm">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="font-aptos-regular flex flex-col gap-1 col-span-2">
                <label>Message</label>
                <textarea
                  rows={5}
                  {...register('message', {
                    required: 'Message is required',
                    maxLength: {
                      value: 2000,
                      message: 'Maximum length is 2000 characters',
                    },
                  })}
                  className="border-2 border-gray-300 p-1.5 rounded-md"
                ></textarea>
                {errors.message && (
                  <p className="text-red-500 text-sm">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                disabled={mutation.isPending}
                type="submit"
                className="font-aptos-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed col-span-2 bg-[#ff7010] rounded-md text-white text-sm py-3"
              >
                {mutation.isPending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="order-first md:order-none overflow-clip bg-slate-200 p-8">
            <h1 className="font-aptos-bold text-2xl xl:text-3xl lg:whitespace-nowrap">
              Contact Information
            </h1>
            <div className="mt-8">
              <div className="font-aptos-regular flex gap-3">
                <MdEmail size={24} className="text-[#ff7010]" />
                <div>
                  <h5 className="font-aptos-bold text-gray-700">Email</h5>
                  <p className="">support@dealstreetjournal.com</p>
                </div>
              </div>
              <div className="font-aptos-regular flex gap-3 mt-8">
                <MdPhone size={24} className="text-[#ff7010]" />
                <div>
                  <h5 className="font-aptos-bold text-gray-700">Phone</h5>
                  <p>+91 9560-7143-99</p>
                </div>
              </div>
              <div className="font-aptos-regular flex gap-3 mt-8">
                <MdLocationOn size={48} className="text-[#ff7010]" />
                <div>
                  <h5 className="font-aptos-bold text-gray-700">Address</h5>
                  <p>
                    409, World Trade Center, Babar Road, Connaught Place, Delhi
                    110001
                  </p>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-aptos-bold mt-10">Follow Us</h1>
                <div className="flex items-center gap-5 text-gray-600 mt-3">
                  <FaXTwitter
                    size={20}
                    className="hover:text-black transition-colors cursor-pointer"
                  />
                  <FaLinkedin
                    size={20}
                    className="hover:text-blue-700 transition-colors cursor-pointer"
                  />
                  <FaInstagram
                    size={20}
                    className="hover:text-pink-500 transition-colors cursor-pointer"
                  />
                  <FaFacebook
                    size={20}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ContactUs
