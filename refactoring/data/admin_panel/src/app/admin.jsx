import { View, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Package, Users, ArrowLeftRight } from "lucide-react-native";
import { useState, useEffect } from "react";

import { ProductItem } from "@/components/Admin/ProductItem";
import { ProductForm } from "@/components/Admin/ProductForm";
import { ClientItem } from "@/components/Admin/ClientItem";
import { ClientEditModal } from "@/components/Admin/ClientEditModal";
import { TransactionItem } from "@/components/Admin/TransactionItem";
import { AdminHeader } from "@/components/Admin/AdminHeader";
import { EmptyState } from "@/components/Admin/EmptyState";

import { useProducts } from "@/hooks/useProducts";
import { useClients } from "@/hooks/useClients";
import { useTransactions } from "@/hooks/useTransactions";

export default function Admin() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("products");

  // Products state
  const {
    products,
    loading: loadingProducts,
    loadProducts,
    deleteProduct,
  } = useProducts();
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Clients state
  const {
    clients,
    loading: loadingClients,
    loadClients,
    updateClientStatus,
    deleteClient,
  } = useClients();
  const [editingClient, setEditingClient] = useState(null);

  // Transactions state
  const {
    transactions,
    loading: loadingTransactions,
    loadTransactions,
    updateTransactionStatus,
  } = useTransactions();

  useEffect(() => {
    if (activeTab === "products") loadProducts();
    if (activeTab === "clients") loadClients();
    if (activeTab === "transactions") loadTransactions();
  }, [activeTab]);

  // ===== PRODUCTS FUNCTIONS =====
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (product) => {
    Alert.alert(
      "Supprimer le produit",
      `Êtes-vous sûr de vouloir supprimer "${product.name}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteProduct(product.id),
        },
      ],
    );
  };

  const handleSaveProduct = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  // ===== CLIENTS FUNCTIONS =====
  const handleEditClient = (client) => {
    setEditingClient(client);
  };

  const handleSaveClientEdit = () => {
    setEditingClient(null);
    loadClients();
  };

  const handleAdjustBalance = (client) => {
    setEditingClient(client);
  };

  const handleSaveBalanceAdjustment = () => {
    setEditingClient(null);
    loadClients();
  };

  const handleToggleClientStatus = async (client) => {
    const newStatus = client.status === "active" ? "suspended" : "active";
    const actionText = newStatus === "active" ? "activer" : "suspendre";

    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} le compte`,
      `Voulez-vous ${actionText} le compte de ${client.name} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          onPress: () => updateClientStatus(client.id, newStatus),
        },
      ],
    );
  };

  const handleDeleteClient = (client) => {
    Alert.alert(
      "Supprimer le client",
      `Êtes-vous sûr de vouloir supprimer ${client.name} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteClient(client.id),
        },
      ],
    );
  };

  // ===== TRANSACTIONS FUNCTIONS =====
  const handleApproveTransaction = async (transaction) => {
    Alert.alert(
      "Approuver la transaction",
      `Confirmer ${transaction.type} de $${transaction.amount} pour ${transaction.client_name} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Approuver",
          onPress: () => updateTransactionStatus(transaction.id, "completed"),
        },
      ],
    );
  };

  const handleRejectTransaction = async (transaction) => {
    Alert.alert(
      "Rejeter la transaction",
      `Rejeter ${transaction.type} de $${transaction.amount} pour ${transaction.client_name} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Rejeter",
          style: "destructive",
          onPress: () => updateTransactionStatus(transaction.id, "rejected"),
        },
      ],
    );
  };

  const tabs = [
    { id: "products", label: "Produits", icon: Package },
    { id: "clients", label: "Clients", icon: Users },
    { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar style="dark" />

      <AdminHeader
        insets={insets}
        activeTab={activeTab}
        showProductForm={showProductForm}
        onAddProduct={() => setShowProductForm(true)}
        tabs={tabs}
        onTabChange={setActiveTab}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 80,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <>
            {showProductForm && (
              <ProductForm
                product={editingProduct}
                onSave={handleSaveProduct}
                onCancel={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                }}
              />
            )}

            {loadingProducts ? (
              <ActivityIndicator
                size="large"
                color="#2563EB"
                style={{ marginTop: 40 }}
              />
            ) : products.length === 0 ? (
              <EmptyState icon={Package} message="Aucun produit" />
            ) : (
              products.map((product) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              ))
            )}
          </>
        )}

        {/* CLIENTS TAB */}
        {activeTab === "clients" && (
          <>
            {loadingClients ? (
              <ActivityIndicator
                size="large"
                color="#2563EB"
                style={{ marginTop: 40 }}
              />
            ) : clients.length === 0 ? (
              <EmptyState icon={Users} message="Aucun client" />
            ) : (
              clients.map((client) => (
                <ClientItem
                  key={client.id}
                  client={client}
                  onEdit={handleEditClient}
                  onToggleStatus={handleToggleClientStatus}
                  onDelete={handleDeleteClient}
                />
              ))
            )}
          </>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === "transactions" && (
          <>
            {loadingTransactions ? (
              <ActivityIndicator
                size="large"
                color="#2563EB"
                style={{ marginTop: 40 }}
              />
            ) : transactions.length === 0 ? (
              <EmptyState icon={ArrowLeftRight} message="Aucune transaction" />
            ) : (
              transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onApprove={handleApproveTransaction}
                  onReject={handleRejectTransaction}
                />
              ))
            )}
          </>
        )}
      </ScrollView>

      <ClientEditModal
        client={editingClient}
        visible={!!editingClient}
        onClose={() => setEditingClient(null)}
        onSave={handleSaveClientEdit}
      />
    </View>
  );
}
