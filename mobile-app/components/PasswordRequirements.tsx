import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

interface RequirementProps {
  label: string;
  met: boolean;
}

const Requirement = ({ label, met }: RequirementProps) => (
  <View style={styles.requirementRow}>
    <Feather
      name={met ? "check-circle" : "circle"}
      size={14}
      color={met ? "#16a34a" : "#94a3b8"}
    />
    <Text style={[styles.requirementText, { color: met ? "#16a34a" : "#64748b" }]}>
      {label}
    </Text>
  </View>
);

interface PasswordRequirementsProps {
  password: string;
}

export const validatePassword = (pass: string) => {
  return {
    length: pass.length >= 6,
    uppercase: /[A-Z]/.test(pass),
    lowercase: /[a-z]/.test(pass),
    number: /[0-9]/.test(pass),
  };
};

export default function PasswordRequirements({ password }: PasswordRequirementsProps) {
  if (!password) return null;

  const reqs = validatePassword(password);

  return (
    <View style={styles.container}>
      <Requirement label="Minimum 6 characters" met={reqs.length} />
      <Requirement label="At least one uppercase letter" met={reqs.uppercase} />
      <Requirement label="At least one lowercase letter" met={reqs.lowercase} />
      <Requirement label="At least one number" met={reqs.number} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginTop: -5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 2,
  },
  requirementText: {
    fontSize: 12,
  },
});
