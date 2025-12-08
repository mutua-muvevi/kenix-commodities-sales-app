const sanitizeUser = (user, fields) => {
    const sanitized = {};

    fields.forEach((field) => {
        const value = field.split(".").reduce((acc, key) => acc && acc[key], user);
        if (value !== undefined) {
            sanitized[field.split(".").pop()] = value; // Use the last key as the output field
        }
    });

    return sanitized;
};

module.exports = { sanitizeUser };