import React, { useContext, useState, useRef } from 'react';
import { Check, UserPlus, Info, Wand2 } from 'lucide-react';
import { all_provider } from '../components/ContextProvider';
import { motion } from 'framer-motion';

const AdminPage = () => {
  const { addnewmember, Notify } = useContext(all_provider);
  const formRef = useRef(null) // To access inputs directly

  const [newdata, setnewdata] = useState({
    gender: '',
  });

  // Generate random placeholder
  const generateValue = (type) => {
    const timestamp = Date.now().toString().slice(-5)
    if (type === 'phone') return `080000${timestamp}`
    if (type === 'email') return `pending${timestamp}@temp.com`
    if (type === 'middle') return `N/A`
  }

  // This just sets the input value
  const handleSetRandom = (fieldName, type) => {
    const input = formRef.current.elements[fieldName]
    if (input) {
      input.value = generateValue(type)
      input.focus() // so user sees it filled
      Notify("info", `${label} auto-filled`)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target)
    const surname = formData.get('surname')
    const phoneNumber = formData.get('phoneNumber')
    const firstName = formData.get('firstName')
    const middleName = formData.get('middleName')
    const dateOfBirth = formData.get('dateOfBirth')
    const emailAddress = formData.get('emailAddress')

    if (!surname ||!firstName ||!newdata.gender) {
      Notify("failure", "Please fill Surname, First Name and Gender");
      return;
    }

    await addnewmember(
      surname, firstName, middleName,
      phoneNumber, dateOfBirth, newdata.gender,
      emailAddress
    );

    Notify("success", "Member added successfully");
    e.target.reset();
    setnewdata({ gender: '' })
  };

  const InputField = ({ label, name, placeholder, type = "text", required, showButton, buttonType }) => (
    <div className="flex flex-col items_start gap-1.5">
      <label className="text-[12px] font-medium flex text-green-600 p-2 rounded-3xl bg-gray-800/60">
        {label} {required && <span className="text-[#B3261E]">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        required={required}
        className="w-full bg-gray-700/60 hover:bg-blue-700/80 rounded-3xl p-3 py-4 text-xs transition-all outline-none"
      />

      {showButton && (
        <button
          type="button" // important: not submit
          onClick={() => handleSetRandom(name, buttonType)}
          className="flex items-center gap-2 w-fit text-[11px] text-blue-300 bg-blue-900/80 px-3 py-1.5 rounded-xl hover:bg-[#D3E3FD] transition-all mt-1 ml-2"
        >
          <Wand2 size={14} /> Not Provided
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full min-h-screen pb-20 pt-10">

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto px-4 mt-8"
      >
        <header className="mb-10 flex items-center gap-5 px-2">
            <div className="bg-blue-700 text-white p-4 rounded-3xl text-[#041E49]">
                <UserPlus size={28} />
            </div>
            <div>
                <h1 className="text-xl font-medium text-gray-200">Management</h1>
                <p className="text-xs text-[#44474E]">Add a new teen to the Miracle Center database</p>
            </div>
        </header>

        <div className=" rounded-[28px] p-6 md:p-10 ">
          <div className="flex items-center gap-2 mb-8 text-[#0B57D0]">
            <Info size={18} />
            <h2 className="text-md text-amber-800 font-medium">Personal Information</h2>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">

              <InputField label="Surname" name="surname" placeholder="Adebayo" required />
              <InputField label="First Name" name="firstName" placeholder="Samuel" required />

              <InputField
                label="Middle Name"
                name="middleName"
                placeholder="Optional"
                showButton={true}
                buttonType="middle"
              />

              <InputField
                label="Phone number"
                name="phoneNumber"
                placeholder="080xxxxxxxxx"
                type="tel"
                showButton={true}
                buttonType="phone"
              />

              <InputField label="Date of Birth" name="dateOfBirth" type="date" />

              <InputField
                label="Email"
                name="emailAddress"
                placeholder="teen@gmail.com"
                type="email"
                showButton={true}
                buttonType="email"
              />

              <div className="flex flex-col gap-1.5">
                <label className="ml-4 text-[12px] font-medium text-green-700">Gender <span className="text-[#B3261E]">*</span></label>
                <div className="flex bg-gray-700 text-xs p-1 rounded-3xl">
                  {['Male', 'Female'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setnewdata({...newdata, gender: item })}
                      className={`flex-1 p-3 text-sm rounded-3xl text-sm font-bold transition-all ${
                        newdata.gender === item
                      ? "bg-green-700 text-green-900 text-green-200"
                        : " hover:bg-black/5 text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center md:justify-end pt-8">
              <button
                type="submit"
                className="w-full text-xs p-3 md:w-auto flex items-center justify-center gap-3 bg-[#0B57D0] text-white px-6 rounded-3xl font-bold hover:shadow-lg active:scale-95 transition-all"
              >
                Register Member
                <span className="p-2 bg-white rounded-xl text-blue-600">
                  <Check size={20} />
                </span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPage;
