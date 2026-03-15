import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db } from "../services/firebase";
import styles from "./profile.styles";
import { useTheme } from "../../constants/ThemeContext";

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc
} from "firebase/firestore";

import { signOut } from "firebase/auth";

const CLOUD_NAME = "dstfo8pxq";
const UPLOAD_PRESET = "unitrade_upload";

export default function Profile() {

  const { theme, toggleTheme, darkMode } = useTheme();

  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [editVisible, setEditVisible] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [faculty, setFaculty] = useState("");
  const [university, setUniversity] = useState("");

  const [showUniversityList, setShowUniversityList] = useState(false);
  const [showFacultyList, setShowFacultyList] = useState(false);

  const universities = [
    "Cairo University",
    "Ain Shams University",
    "Alexandria University",
    "Mansoura University",
    "Assiut University",
    "Helwan University",
    "Tanta University",
    "Zagazig University",
    "Suez Canal University",
    "Al-Azhar University",
    "German University in Cairo",
    "British University in Egypt",
    "October 6 University",
    "Future University in Egypt",
    "AASTMT",
    "Nile University",
    "Others"
  ];

  const faculties = [
    "Computer Science",
    "Engineering",
    "Medicine",
    "Pharmacy",
    "Law",
    "Business Administration",
    "Dentistry",
    "Arts",
    "Science",
    "Nursing",
    "Others"
  ];

  /* ================= USER DATA ================= */

  useEffect(() => {

    const loadUser = async () => {

      const uid = auth.currentUser?.uid;

      if (!uid) return;

      const ref = doc(db, "users", uid);

      const snap = await getDoc(ref);

      if (snap.exists()) {

        const data = snap.data();

        setUser(data);

        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setPhone(data.phoneNumber || "");
        setFaculty(data.faculty || "");
        setUniversity(data.university || "");

      }

    };

    loadUser();

  }, []);

  /* ================= USER PRODUCTS ================= */

  useEffect(() => {

    const uid = auth.currentUser?.uid;

    if (!uid) return;

    const q = query(
      collection(db, "products"),
      where("userId", "==", uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setItems(data);

    });

    return unsub;

  }, []);

  /* ================= DELETE PRODUCT ================= */

  const deleteProduct = (id: string) => {

    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {

            await deleteDoc(doc(db, "products", id));

          }
        }
      ]
    );

  };
  /* ================= MARK SOLD ================= */

  const markSold = async (id: string) => {

    await updateDoc(doc(db, "products", id), {
      sold: true
    });

  };

  const uploadImage = async (imageUri: string) => {

    const data = new FormData();

    data.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "profile.jpg"
    } as any);

    data.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: data
      }
    );

    const file = await res.json();

    return file.secure_url;

  };

  /* ================= PICK IMAGE ================= */

  const pickImage = async () => {

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7
    });

    if (!result.canceled) {

      const uri = result.assets[0].uri;

      const cloudUrl = await uploadImage(uri);

      setUser({
        ...user,
        profilePhoto: cloudUrl
      });

      const uid = auth.currentUser?.uid;

      if (!uid) return;

      await updateDoc(doc(db, "users", uid), {
        profilePhoto: cloudUrl
      });

    }

  };

  /* ================= SAVE PROFILE ================= */

  const saveProfile = async () => {

    const uid = auth.currentUser?.uid;

    if (!uid) return;

    await updateDoc(doc(db, "users", uid), {
      firstName,
      lastName,
      phoneNumber: phone,
      faculty,
      university
    });

    setUser({
      ...user,
      firstName,
      lastName,
      phoneNumber: phone,
      faculty,
      university
    });

    setEditVisible(false);

  };

  /* ================= LOGOUT ================= */

  const handleLogout = async () => {
    try {

      setItems([]);

      await signOut(auth);

      router.replace("/");

    } catch (error) {
      console.log(error);
    }
  };return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 200 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerCard, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{
              uri: user?.profilePhoto || "https://images.unsplash.com/photo-1633332755192-727a05c4013d"
            }}
            style={styles.avatar}
          />
          <View style={styles.cameraIcon}>
            <Feather name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>

        <Text style={[styles.name, { color: theme.text }]}>
          {user?.firstName} {user?.lastName}
        </Text>

        <Text style={[styles.university, { color: theme.text }]}>
          {user?.university}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtnProfile}
            onPress={() => setEditVisible(true)}
          >
            <Feather name="edit" size={16} color="#2563EB" />
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => router.push("/forgot-password/forgot-password")}
          >
            <Feather name="lock" size={16} color="white" />
            <Text style={styles.resetText}>Reset Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.editBtnProfile, { marginTop: 10 }]}
            onPress={toggleTheme}
          >
            <Feather
              name={darkMode ? "sun" : "moon"}
              size={16}
              color="#2563EB"
            />
            <Text style={styles.editText}>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Personal Information
        </Text>

        <View style={styles.infoRow}>
          <Feather name="mail" size={18} color="#2563EB" />
          <Text style={[styles.infoText, { color: theme.text }]}>{user?.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Feather name="phone" size={18} color="#2563EB" />
          <Text style={[styles.infoText, { color: theme.text }]}>{user?.phoneNumber}</Text>
        </View>

        <View style={styles.infoRow}>
          <Feather name="book" size={18} color="#2563EB" />
          <Text style={[styles.infoText, { color: theme.text }]}>{user?.faculty}</Text>
        </View>

        <View style={styles.infoRow}>
          <Feather name="map-pin" size={18} color="#2563EB" />
          <Text style={[styles.infoText, { color: theme.text }]}>{user?.university}</Text>
        </View>
      </View>

      <View style={styles.listingsHeader}>
        <Feather name="grid" size={18} color="#2563EB" />
        <Text style={[styles.sectionTitle, { color: theme.text }]}>My Listings</Text>
      </View>

      <View style={styles.products}>
        {items.map((item: any) => {
          const image = Array.isArray(item.images) && item.images.length > 0
            ? item.images[0]
            : "https://via.placeholder.com/150";

          return (
            <View key={item.id} style={[styles.productCard, { backgroundColor: theme.card }]}>
              <View>
                {item.sold && (
                  <View style={styles.soldBadge}>
                    <Text style={styles.soldTextBadge}>SOLD</Text>
                  </View>
                )}
                <Image source={{ uri: image }} style={styles.productImage} />
              </View>

              <View style={styles.productInfo}>
                <Text style={[styles.productTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={styles.price}>{item.price} EGP</Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.push({ pathname: "/product/edit-product", params: { id: item.id } })}
                  >
                    <Feather name="edit" size={14} color="white" />
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteProduct(item.id)}
                  >
                    <Feather name="trash-2" size={14} color="white" />
                    <Text style={styles.actionText}>Delete</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.soldRow}>
                  <TouchableOpacity style={styles.soldBtn} onPress={() => markSold(item.id)}>
                    <Feather name="check-circle" size={16} color={item.sold ? "#22c55e" : "white"} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Feather name="log-out" size={18} color="white" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Modal visible={editVisible} animationType="slide">
        <View style={[styles.modal, { backgroundColor: theme.background }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>

          <TextInput
            placeholder="First Name"
            placeholderTextColor="#9ca3af"
            value={firstName}
            onChangeText={setFirstName}
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
          />

          <TextInput
            placeholder="Last Name"
            placeholderTextColor="#9ca3af"
            value={lastName}
            onChangeText={setLastName}
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
          />

          <TextInput
            placeholder="Phone"
            placeholderTextColor="#9ca3af"
            value={phone}
            onChangeText={setPhone}
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
          />

          {/* الكلية والجامعة مع البحث والقوائم */}
          <TextInput
            placeholder="University"
            placeholderTextColor="#9ca3af"
            value={university}
            onFocus={() => setShowUniversityList(true)}
            onChangeText={(text) => { setUniversity(text); setShowUniversityList(true); }}
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
          />

          {showUniversityList && (
            <ScrollView style={{ maxHeight: 150, backgroundColor: theme.card, borderRadius: 8, marginBottom: 10 }}>
              {universities.filter(u => u.toLowerCase().includes(university.toLowerCase())).map(u => (
                <TouchableOpacity
                  key={u}
                  onPress={() => { setUniversity(u); setShowUniversityList(false); }}
                  style={{ padding: 10, borderBottomWidth: 1, borderColor: darkMode ? "#374151" : "#eee" }}
                >
                  <Text style={{ color: theme.text }}>{u}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <TextInput
            placeholder="Faculty"
            placeholderTextColor="#9ca3af"
            value={faculty}
            onFocus={() => setShowFacultyList(true)}
            onChangeText={(text) => { setFaculty(text); setShowFacultyList(true); }}
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
          />

          {showFacultyList && (
            <ScrollView style={{ maxHeight: 150, backgroundColor: theme.card, borderRadius: 8, marginBottom: 10 }}>
              {faculties.filter(f => f.toLowerCase().includes(faculty.toLowerCase())).map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => { setFaculty(f); setShowFacultyList(false); }}
                  style={{ padding: 10, borderBottomWidth: 1, borderColor: darkMode ? "#374151" : "#eee" }}
                >
                  <Text style={{ color: theme.text }}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}