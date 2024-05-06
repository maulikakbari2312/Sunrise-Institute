import React, { useEffect, useState } from "react";
import { FormControl, TextField, FormHelperText, Checkbox, FormLabel, FormControlLabel, RadioGroup, Radio, Select, InputLabel, MenuItem, OutlinedInput, ListItemText, } from "@mui/material";
import { useField, useFormikContext } from "formik";
import { useSelector } from "react-redux";
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: 30 * 4.5 + 4,
            width: 250,
        },
    },
};

export const InputField = ({
    name,
    placeholder,
    form,
    type = 'text',
    disabled = false,
    isManual = false,
    handleInputChange,
}) => {
    const selected = useSelector((state) => state.selected);
    const [formikField, meta] = useField(name);
    const handleChange = (e) => {
        if (name === 'mobileNumber' || name === 'parentMobileNumber') {
            const value = e.target.value;
            if (/^\d*$/.test(value)) { // Use regex to allow only numbers
                form.setFieldValue(name, value === '' ? '' : value);
            }
        } else if (type === 'number') {
            const value = e.target.value;
            // Check if the entered value is a valid number or a valid decimal number
            if (!isNaN(value) || value === '' || value === '.' || /^\d*\.?\d*$/.test(value)) {
                const { name, value } = e.target;
                form.setFieldValue(name, value === '' ? '' : value);
            }
        } else {
            formikField.onChange(e);
        }
    };

    const handleChangeisManual = (e) => {
        if (selected?.modelData?.page === "pendingInstallments") {
            if (e.target.name == 'partialPayment') {
                handleInputChange(e, form)
            } else if (e.target.value <= selected?.selectData?.user?.totalPendingInstallment) {
                // Call formikField.onChange to update Formik state
                const value = e.target.value;
                // Check if the entered value is a valid number or a valid decimal number
                if (!isNaN(value) || value === '' || value === '.' || /^\d*\.?\d*$/.test(value)) {
                    const { name, value } = e.target;
                    form.setFieldValue(name, Number(value) === '' ? '' : Number(value));
                }
                // Update the 'payInstallmentFees' field based on the conditions
                form.setFieldValue('payInstallment', (e.target.value * selected?.selectData?.user?.installmentAmount)?.toFixed(2));
                form.setFieldValue('payInstallmentFees', (Number((e.target.value) * Number(selected?.selectData?.user?.installmentAmount)) - Number(form.values?.partialPayment) + Number(form.values.duePartialPayment))?.toFixed(2));
            } else if (e.target.name !== 'duePendingInstallment') {
                handleInputChange(e, form)
            }
        } else {
            // Call formikField.onChange for other cases
            handleInputChange(e, form)
        }
    }


    return (
        <FormControl error={meta.touched && meta.error} sx={{ width: "100%", minWidth: "200px" }} >
            {!isManual ? (
                <TextField
                    {...formikField}
                    fullWidth
                    size="Normal"
                    label={placeholder}
                    name={name}
                    placeholder={placeholder}
                    disabled={disabled}
                    onChange={handleChange}
                    type={type === 'email' ? 'email' : 'text'}
                    error={meta.touched && meta.error}
                />
            ) : (
                <TextField
                    {...formikField}
                    fullWidth
                    size="Normal"
                    label={placeholder}
                    name={name}
                    placeholder={placeholder}
                    disabled={disabled}
                    onChange={handleChangeisManual}
                    type={type === 'email' ? 'email' : 'text'}
                    error={meta.touched && meta.error}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            )}
            {meta.touched && meta.error && (
                <FormHelperText>{meta.error}</FormHelperText>
            )}
        </FormControl>
    );
};
export const InputFieldValue = ({
    name,
    placeholder,
    form,
    type = 'text',
    disabled = false,
    isManual = false,
    handleInputChange,
    value
}) => {
    const selected = useSelector((state) => state.selected);
    const [formikField, meta] = useField(name);
    const handleChange = (e) => {
        if (name === 'mobileNumber' || name === 'parentMobileNumber') {
            const value = e.target.value;
            if (/^\d*$/.test(value)) { // Use regex to allow only numbers
                form.setFieldValue(name, value === '' ? '' : value);
            }
        } else if (type === 'number') {
            const value = e.target.value;
            // Check if the entered value is a valid number or a valid decimal number
            if (!isNaN(value) || value === '' || value === '.' || /^\d*\.?\d*$/.test(value)) {
                const { name, value } = e.target;
                form.setFieldValue(name, value === '' ? '' : value);
            }
        } else {
            formikField.onChange(e);
        }
    };

    const handleChangeisManual = (e) => {
        if (selected?.modelData?.page === "pendingInstallments") {
            if (e.target.name == 'partialPayment') {
                handleInputChange(e, form)
            } else if (e.target.value <= selected?.selectData?.user?.totalPendingInstallment) {
                // Call formikField.onChange to update Formik state
                const value = e.target.value;
                // Check if the entered value is a valid number or a valid decimal number
                if (!isNaN(value) || value === '' || value === '.' || /^\d*\.?\d*$/.test(value)) {
                    const { name, value } = e.target;
                    form.setFieldValue(name, Number(value) === '' ? '' : Number(value));
                }
                // Update the 'payInstallmentFees' field based on the conditions
                form.setFieldValue('payInstallment', (e.target.value * selected?.selectData?.user?.installmentAmount)?.toFixed(2));
                form.setFieldValue('payInstallmentFees', (Number((e.target.value) * Number(selected?.selectData?.user?.installmentAmount)) - Number(form.values?.partialPayment) + Number(form.values.duePartialPayment))?.toFixed(2));
            } else if (e.target.name !== 'duePendingInstallment') {
                handleInputChange(e, form)
            }
        } else {
            // Call formikField.onChange for other cases
            handleInputChange(e, form)
        }
    }


    return (
        <FormControl error={meta.touched && meta.error} sx={{ width: "100%", minWidth: "200px" }} >
            {!isManual ? (
                <TextField
                    {...formikField}
                    fullWidth
                    size="Normal"
                    label={placeholder}
                    name={name}
                    placeholder={placeholder}
                    disabled={disabled}
                    onChange={handleChange}
                    type={type === 'email' ? 'email' : 'text'}
                    error={meta.touched && meta.error}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={value}
                />
            ) : (
                <TextField
                    {...formikField}
                    fullWidth
                    size="Normal"
                    label={placeholder}
                    name={name}
                    placeholder={placeholder}
                    disabled={disabled}
                    onChange={handleChangeisManual}
                    type={type === 'email' ? 'email' : 'text'}
                    error={meta.touched && meta.error}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={value}
                />
            )}
            {meta.touched && meta.error && (
                <FormHelperText>{meta.error}</FormHelperText>
            )}
        </FormControl>
    );
};

export const InputDateField = ({
    name,
    placeholder,
}) => {
    const [formikField, meta] = useField(name);


    return (
        <FormControl error={meta.touched && meta.error} sx={{ width: "100%", minWidth: "200px" }}>
            <TextField
                {...formikField}
                name={name}
                error={meta.touched && meta.error}
                label={placeholder}
                type="date"
                InputLabelProps={{
                    shrink: true,
                }}
            />
            {meta.touched && meta.error && (
                <FormHelperText>{meta.error}</FormHelperText>
            )}
        </FormControl>
    );
};

export const InputCheckBox = ({ name, placeholder }) => {
    const { initialValues } = useFormikContext();
    const [formikField, meta] = useField(name);

    // Use initialValues to get the initial value of the checkbox
    const initialCheckboxValue = initialValues[name] || false;

    return (
        <FormControl error={meta.touched && meta.error} sx={{ width: "100%", minWidth: "200px", display: 'flex' }}>
            <FormControlLabel
                control={<Checkbox
                    {...formikField}
                    error={meta.touched && meta.error}
                    label={placeholder}
                    name={name}
                    checked={formikField.value || initialCheckboxValue}
                />}
                label={placeholder}
            />
            {meta.touched && meta.error && (
                <FormHelperText>{meta.error}</FormHelperText>
            )}
        </FormControl>
    );
};

export const InputRadioGroup = ({
    name,
    label,
    options,
    isManual = false,
    handleInputChange
}) => {
    const [formikField, meta] = useField(name);

    return (
        <FormControl error={meta.touched && meta.error} sx={{ width: "100%", minWidth: "200px" }}>
            <FormLabel ms="8px" mb="10px" fontSize="1.2rem" fontWeight="normal" sx={{ textAlign: "start" }}>
                {label}
            </FormLabel>
            {
                isManual ?
                    <RadioGroup
                        row
                        {...formikField}
                        name={name}
                        value={formikField.value}
                        onChange={handleInputChange}
                        onBlur={formikField.onBlur}
                    >
                        {options.map((option, index) => (
                            <FormControlLabel
                                key={index}
                                value={option.value || option}
                                control={<Radio />}
                                label={option.label || option}
                                name={option.value}
                            />
                        ))}
                    </RadioGroup>
                    :
                    <RadioGroup
                        row
                        {...formikField}
                        name={name}
                        value={formikField.value}
                        onChange={formikField.onChange}
                        onBlur={formikField.onBlur}
                    >
                        {options.map((option, index) => (
                            <FormControlLabel
                                key={index}
                                value={option.value || option}
                                control={<Radio />}
                                label={option.label || option}
                                name={name}
                            />
                        ))}
                    </RadioGroup>
            }
            {meta.touched && meta.error && (
                <FormHelperText>{meta.error}</FormHelperText>
            )}
        </FormControl>
    );
};


export const CustomTextAreaComponents = ({
    name,
    placeholder,
    min = 1,
    max = 4,
    isManual = false,
    handleInputChange,
    form,
}) => {
    const [formikField, meta] = useField(name);

    return (
        <FormControl error={meta.touched && meta.error} sx={{ width: "100%", minWidth: "200px" }}>
            {isManual ?
                <TextField
                    {...formikField}
                    fullWidth
                    size="Normal"
                    label={placeholder}
                    name={name}
                    placeholder={placeholder}
                    error={meta.touched && meta.error}
                    multiline
                    minRows={min}
                    maxRows={max}
                    // rows={min} // You can adjust this number as needed
                    variant="outlined"
                    onChange={(e) => { handleInputChange(e, form) }}
                /> :
                <TextField
                    {...formikField}
                    fullWidth
                    size="Normal"
                    label={placeholder}
                    name={name}
                    placeholder={placeholder}
                    error={meta.touched && meta.error}
                    multiline
                    minRows={min}
                    maxRows={max}
                    // rows={min} // You can adjust this number as needed
                    variant="outlined"
                />
            }      {meta.touched && meta.error && (
                <FormHelperText>{meta.error}</FormHelperText>
            )}
        </FormControl>
    );
};

export const CustomTextAreaComponentsvalue = ({
    name,
    placeholder,
    min = 1,
    max = 4,
    isManual = false,
    handleInputChange,
    form,
    value
}) => {
    const [formikField, meta] = useField(name);

    return (
        <FormControl error={meta.touched && meta.error} sx={{ width: "100%", minWidth: "200px" }}>
            {isManual ?
                <TextField
                    {...formikField}
                    fullWidth
                    size="Normal"
                    label={placeholder}
                    name={name}
                    placeholder={placeholder}
                    error={meta.touched && meta.error}
                    multiline
                    minRows={min}
                    maxRows={max}
                    // rows={min} // You can adjust this number as needed
                    variant="outlined"
                    onChange={(e) => { handleInputChange(e, form) }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={value}
                /> :
                <TextField
                    {...formikField}
                    fullWidth
                    size="Normal"
                    label={placeholder}
                    name={name}
                    placeholder={placeholder}
                    error={meta.touched && meta.error}
                    multiline
                    minRows={min}
                    maxRows={max}
                    // rows={min} // You can adjust this number as needed
                    variant="outlined"
                    value={value}
                />
            }      {meta.touched && meta.error && (
                <FormHelperText>{meta.error}</FormHelperText>
            )}
        </FormControl>
    );
};

export const CustomSelectComponent = ({ name, label, options, isManual = false, handleInputChange }) => {
    const [formikField, meta] = useField(name);

    return (
        <FormControl error={meta.touched && meta.error} sx={{ width: '100%', minWidth: '200px' }}>
            <InputLabel id={`${name}-label`}>{label}</InputLabel>
            {
                isManual ?
                    <Select
                        {...formikField}
                        labelId={`${name}-label`}
                        label={label}
                        displayEmpty
                        error={meta.touched && meta.error}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        onChange={handleInputChange}
                        MenuProps={MenuProps}
                    >
                        {options.map((option) => (
                            <MenuItem key={option.value || option} value={option.value || option}>
                                {option.label || option}
                            </MenuItem>
                        ))}
                    </Select>
                    :
                    <Select
                        {...formikField}
                        labelId={`${name}-label`}
                        label={label}
                        displayEmpty
                        error={meta.touched && meta.error}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        MenuProps={MenuProps}
                    >
                        {options.map((option) => (
                            <MenuItem key={option.value || option} value={option.value || option}>
                                {option.label || option}
                            </MenuItem>
                        ))}
                    </Select>
            }
            {meta.touched && meta.error && (
                <FormHelperText>{meta.error}</FormHelperText>
            )}
        </FormControl>
    );
};

export const InputSelectNR = ({
    name,
    options,
    value, // Make sure this is always an array
    handleInputChange,
    placeholder,
}) => {

    return (
        <FormControl sx={{ width: "100%", minWidth: "200px" }}>
            <Select
                sx={{
                    color: 'white',
                    background: value === "reject" ? '#ff413a' : value === "demo" ? '#3366ff' : value === "enroll" ? '#00ac69' : '#f4a100'
                }}
                size="small"
                id={`demo-simple-select `}
                name={name}
                value={value}
                onChange={handleInputChange}
            >
                {Array.isArray(options) && options.map((option) => (
                    <MenuItem key={option} value={option}>
                        <ListItemText primary={option} />
                    </MenuItem>
                ))}

            </Select>
        </FormControl>
    );
};

export const CustomMultiSelect = ({
    name,
    options,
    value, // Make sure this is always an array
    handleInputChange,
    placeholder,
}) => {
    const [formikField, meta] = useField(name);
    const isArray = Array.isArray(value);
    const selectedValues = isArray ? value : [];
    return (
        <FormControl error={meta.touched && meta.error} sx={{ width: "100%", minWidth: "200px" }}>
            <InputLabel id={`demo-multiple-checkbox-label`}>{placeholder}</InputLabel>
            <Select
                {...formikField}
                error={meta.touched && meta.error}
                labelId={`demo-multiple-checkbox-label`}
                name={name}
                multiple
                value={selectedValues} // Ensure it's always an array
                input={<OutlinedInput label={placeholder} />}
                renderValue={(selected) => {
                    if (Array.isArray(selected)) {
                        return selected.join(', ');
                    } else {
                        return '';
                    }
                }}
                MenuProps={MenuProps}
                onChange={handleInputChange}
            >
                {Array.isArray(options) && options.map((option) => (
                    <MenuItem key={option} value={option}>
                        <Checkbox checked={selectedValues.includes(option)} />
                        <ListItemText primary={option} />
                    </MenuItem>
                ))}

            </Select>
            {meta.touched && meta.error && (
                <FormHelperText>{meta.error}</FormHelperText>
            )}
        </FormControl>
    );
};
export const InputImage = ({ name, placeholder, handleImageChange }) => {
    const [meta] = useField(name);
    const handleInputChange = (e) => {
        const file = e.target.files[0];
        handleImageChange(file); // Pass the file to the parent handler
    };

    return (
        <FormControl error={meta.touched && meta.error} sx={{ width: "100%", minWidth: "200px", display: 'none' }}>
            <TextField
                fullWidth
                size="Normal"
                type="file"
                name={name}
                placeholder={placeholder}
                error={meta.touched && meta.error}
                // {...formikField}
                className="picture__input"
                id="picture__input"
                onChange={handleInputChange}
            />
            {meta.touched && meta.error && (
                <FormHelperText>{meta.error}</FormHelperText>
            )}
        </FormControl>
    );
};