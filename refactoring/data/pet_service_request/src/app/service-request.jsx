import React, { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/utils/auth/useAuth";
import { useAppTheme } from "@/components/AppTheme";
import AppScreen from "@/components/AppScreen";
import AppHeader from "@/components/AppHeader";
import {
  useFonts,
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_800ExtraBold,
} from "@expo-google-fonts/sora";
import { useServiceRequest } from "@/hooks/useServiceRequest";
import { useGroomingForm } from "@/hooks/useGroomingForm";
import { useFuneralForm } from "@/hooks/useFuneralForm";
import { useWalkerForm } from "@/hooks/useWalkerForm";
import {
  generateDates,
  calculateTotal,
  SERVICE_NAMES,
} from "@/utils/serviceRequestUtils";
import { PriceDisplay } from "@/components/ServiceRequest/PriceDisplay";
import { StandardServiceForm } from "@/components/ServiceRequest/StandardServiceForm";
import { FuneralServiceForm } from "@/components/ServiceRequest/FuneralServiceForm";
import { GroomingServiceForm } from "@/components/ServiceRequest/GroomingServiceForm";
import { WalkerServiceForm } from "@/components/ServiceRequest/WalkerServiceForm";
import { ActionButtons } from "@/components/ServiceRequest/ActionButtons";

export default function ServiceRequestScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const { serviceType } = useLocalSearchParams();
  const { auth } = useAuth();

  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_800ExtraBold,
  });

  // Standard form state
  const [petSize, setPetSize] = useState("mediano");
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [requestedTime, setRequestedTime] = useState("09:00");
  const [durationDays, setDurationDays] = useState("1");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [notes, setNotes] = useState("");

  const availableDates = generateDates();

  // Grooming form
  const groomingForm = useGroomingForm();

  // Funeral form
  const funeralForm = useFuneralForm();

  // Walker form
  const walkerForm = useWalkerForm();

  // Fetch pets
  const { data: petsData } = useQuery({
    queryKey: ["pets", auth?.user?.id],
    queryFn: async () => {
      const response = await fetch("/api/pets");
      if (!response.ok) throw new Error("Failed to fetch pets");
      return response.json();
    },
    enabled: !!auth?.user?.id,
  });

  // Fetch pricing
  const { data: pricingData } = useQuery({
    queryKey: ["service-pricing", serviceType],
    queryFn: async () => {
      const response = await fetch(`/api/services/pricing?type=${serviceType}`);
      if (!response.ok) throw new Error("Failed to fetch pricing");
      return response.json();
    },
  });

  const { createRequest, openWhatsApp, openPhone } = useServiceRequest(
    serviceType,
    availableDates,
    selectedDateIndex,
  );

  const currentPrice = pricingData?.pricing?.find(
    (p) =>
      p.pet_size ===
      (serviceType === "peluqueria" ? groomingForm.groomingSize : petSize),
  );

  const total = calculateTotal(currentPrice, durationDays);

  const isFuneralService = serviceType === "funerario";
  const isGroomingService = serviceType === "peluqueria";
  const isWalkerService = serviceType === "paseadores";

  const handleSubmit = () => {
    const selectedDate = availableDates[selectedDateIndex];

    if (isWalkerService) {
      if (!walkerForm.isFormComplete()) {
        Alert.alert("Error", "Por favor completa todos los campos requeridos");
        return;
      }

      createRequest.mutate({
        pet_id: selectedPet,
        service_type: serviceType,
        pet_size: petSize,
        requested_date: selectedDate.toISOString(),
        requested_time: requestedTime,
        duration_days: 1,
        contact_phone: walkerForm.walkerPhone,
        contact_whatsapp: contactWhatsapp,
        notes: JSON.stringify({
          dog: {
            name: walkerForm.walkerDogName,
            breed: walkerForm.walkerDogBreed,
            age: walkerForm.walkerDogAge,
            weight: walkerForm.walkerDogWeight,
          },
          service: {
            address: walkerForm.walkerAddress,
            requirements: walkerForm.walkerRequirements,
          },
          additionalNotes: notes,
        }),
      });
    } else if (isFuneralService) {
      if (!funeralForm.isFormComplete() || !contactPhone.trim()) {
        Alert.alert("Error", "Por favor completa todos los campos requeridos");
        return;
      }

      createRequest.mutate({
        pet_id: selectedPet,
        service_type: serviceType,
        pet_size: petSize,
        requested_date: selectedDate.toISOString(),
        requested_time: requestedTime,
        duration_days: parseInt(durationDays),
        contact_phone: contactPhone,
        contact_whatsapp: contactWhatsapp,
        notes: JSON.stringify({
          owner: {
            fullName: funeralForm.ownerFullName,
            idDocument: funeralForm.ownerIdDocument,
            address: funeralForm.ownerAddress,
            email: funeralForm.ownerEmail,
          },
          pet: {
            name: funeralForm.petName,
            species: funeralForm.petSpecies,
            breed: funeralForm.petBreed,
            weight: funeralForm.petWeight,
            color: funeralForm.petColor,
          },
          paymentMethod: funeralForm.paymentMethod,
          additionalNotes: notes,
        }),
      });
    } else if (isGroomingService) {
      if (!groomingForm.isFormComplete() || !contactPhone.trim()) {
        Alert.alert("Error", "Por favor completa todos los campos requeridos");
        return;
      }

      createRequest.mutate({
        pet_id: selectedPet,
        service_type: serviceType,
        pet_size: groomingForm.groomingSize,
        requested_date: selectedDate.toISOString(),
        requested_time: requestedTime,
        duration_days: 1,
        contact_phone: contactPhone,
        contact_whatsapp: contactWhatsapp,
        notes: JSON.stringify({
          client: {
            name: groomingForm.groomingClientName,
          },
          pet: {
            name: groomingForm.groomingPetName,
            breed: groomingForm.groomingBreed,
            sex: groomingForm.petSex,
            size: groomingForm.groomingSize,
            age: groomingForm.petAge,
            color: groomingForm.groomingColor,
            image: groomingForm.petImage,
          },
          service: {
            address: groomingForm.groomingAddress,
            vaccineUpToDate: groomingForm.vaccineUpToDate,
            location: groomingForm.serviceLocation,
          },
          additionalNotes: notes,
        }),
      });
    } else {
      if (!contactPhone && !contactWhatsapp) {
        Alert.alert("Error", "Ingresa al menos un método de contacto");
        return;
      }

      createRequest.mutate({
        pet_id: selectedPet,
        service_type: serviceType,
        pet_size: petSize,
        requested_date: selectedDate.toISOString(),
        requested_time: requestedTime,
        duration_days: parseInt(durationDays),
        contact_phone: contactPhone,
        contact_whatsapp: contactWhatsapp,
        notes,
      });
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  const header = (
    <AppHeader
      title={SERVICE_NAMES[serviceType] || "Solicitar Servicio"}
      showBackButton={true}
      titleStyle={{
        fontFamily: "Sora_800ExtraBold",
        fontSize: 20,
      }}
    />
  );

  const pets = petsData?.pets || [];
  const needsDuration = ["hospedaje", "daycare"].includes(serviceType);

  const isFormComplete = isFuneralService
    ? funeralForm.isFormComplete() && contactPhone.trim() !== ""
    : isGroomingService
      ? groomingForm.isFormComplete() && contactPhone.trim() !== ""
      : isWalkerService
        ? walkerForm.isFormComplete()
        : true;

  return (
    <AppScreen header={header}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <PriceDisplay
          total={total}
          description={currentPrice?.description}
          colors={colors}
        />

        {isWalkerService ? (
          <WalkerServiceForm
            {...walkerForm}
            notes={notes}
            setNotes={setNotes}
            colors={colors}
          />
        ) : isGroomingService ? (
          <GroomingServiceForm
            {...groomingForm}
            contactPhone={contactPhone}
            setContactPhone={setContactPhone}
            notes={notes}
            setNotes={setNotes}
            colors={colors}
          />
        ) : isFuneralService ? (
          <FuneralServiceForm
            {...funeralForm}
            contactPhone={contactPhone}
            setContactPhone={setContactPhone}
            notes={notes}
            setNotes={setNotes}
            colors={colors}
          />
        ) : (
          <StandardServiceForm
            pets={pets}
            selectedPet={selectedPet}
            setSelectedPet={setSelectedPet}
            petSize={petSize}
            setPetSize={setPetSize}
            availableDates={availableDates}
            selectedDateIndex={selectedDateIndex}
            setSelectedDateIndex={setSelectedDateIndex}
            requestedTime={requestedTime}
            setRequestedTime={setRequestedTime}
            needsDuration={needsDuration}
            durationDays={durationDays}
            setDurationDays={setDurationDays}
            contactPhone={contactPhone}
            setContactPhone={setContactPhone}
            contactWhatsapp={contactWhatsapp}
            setContactWhatsapp={setContactWhatsapp}
            notes={notes}
            setNotes={setNotes}
            colors={colors}
          />
        )}

        <ActionButtons
          onSubmit={handleSubmit}
          isSubmitting={createRequest.isPending}
          isFormComplete={isFormComplete}
          onWhatsApp={() => openWhatsApp({ final_price: total })}
          onPhone={openPhone}
          showContactButtons={
            !isFuneralService && !isGroomingService && !isWalkerService
          }
          colors={colors}
        />
      </ScrollView>
    </AppScreen>
  );
}
