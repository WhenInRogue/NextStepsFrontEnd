import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ApiService from "@/services/ApiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Wrench, AlertTriangle, CheckCircle, Package, Clock } from "lucide-react";

interface Supply {
  supplyId: number;
  name: string;
  currentStock: number;
  maximumQuantity: number;
  reorderLevel: number;
  unitOfMeasurement: string;
}

interface Equipment {
  equipmentId: number;
  name: string;
  totalHours: number;
  lastMaintenanceHours: number;
  maintenanceIntervalHours: number;
  equipmentStatus: string;
}

const DashboardPage = () => {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliesRes, equipmentRes] = await Promise.all([
          ApiService.getAllSupplies(),
          ApiService.getAllEquipment()
        ]);
        if (suppliesRes.status === 200) setSupplies(suppliesRes.supplies || []);
        if (equipmentRes.status === 200) setEquipment(equipmentRes.equipments || []);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Summary statistics
  const lowStockSupplies = supplies.filter((s) => s.currentStock <= s.reorderLevel);
  const totalEquipment = equipment.length;
  const availableEquipment = equipment.filter((e) => e.equipmentStatus === "AVAILABLE").length;
  const maintenanceEquipment = equipment.filter((e) => e.equipmentStatus === "MAINTENANCE").length;

  // Equipment needing maintenance (approaching or past due)
  const getMaintenanceStatus = (e: Equipment) => {
    if (!e.totalHours || !e.maintenanceIntervalHours) return null;
    const lastMaintenance = e.lastMaintenanceHours || 0;
    const nextDue = lastMaintenance + e.maintenanceIntervalHours;
    const hoursUntilDue = nextDue - e.totalHours;
    return { nextDue, hoursUntilDue, overdue: hoursUntilDue <= 0 };
  };

  const maintenanceAlerts = equipment
    .map((e) => ({ ...e, status: getMaintenanceStatus(e) }))
    .filter((e) => e.status && e.status.hoursUntilDue <= e.maintenanceIntervalHours * 0.2) // Within 20% of interval
    .sort((a, b) => (a.status?.hoursUntilDue || 0) - (b.status?.hoursUntilDue || 0));

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        </div>

        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{lowStockSupplies.length}</div>
              <p className="text-xs text-muted-foreground">Supplies need reorder</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Equipment</CardTitle>
              <Wrench className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalEquipment}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-accent">{availableEquipment} available</span>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Out For Maintenance</CardTitle>
              <CheckCircle className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{maintenanceEquipment}</div>
              <p className="text-xs text-muted-foreground">Equipment being serviced</p>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout for Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Supplies */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-destructive" />
                Low Stock Supplies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockSupplies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-accent" />
                  <p>All supplies are well stocked!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockSupplies.map((supply) => {
                    const stockPercent = (supply.currentStock / supply.maximumQuantity) * 100;
                    return (
                      <div key={supply.supplyId} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{supply.name}</span>
                          <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                        </div>
                        <Progress 
                          value={stockPercent} 
                          className="h-2 mb-2 [&>div]:bg-destructive" 
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{supply.currentStock} / {supply.maximumQuantity} {supply.unitOfMeasurement}</span>
                          <span>Reorder at: {supply.reorderLevel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Maintenance Alerts */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Maintenance Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {maintenanceAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-accent" />
                  <p>No upcoming maintenance needed!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenanceAlerts.map((equip) => (
                    <div key={equip.equipmentId} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{equip.name}</span>
                        <Badge 
                          variant={equip.status?.overdue ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {equip.status?.overdue ? "Overdue" : "Due Soon"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="block text-foreground font-medium">{equip.totalHours?.toFixed(1) || 0} hrs</span>
                          <span>Current Hours</span>
                        </div>
                        <div>
                          <span className="block text-foreground font-medium">{equip.status?.nextDue?.toFixed(1) || 0} hrs</span>
                          <span>Next Service Due</span>
                        </div>
                      </div>
                      {equip.status && (
                        <div className="mt-2 text-xs">
                          {equip.status.overdue ? (
                            <span className="text-destructive font-medium">
                              {Math.abs(equip.status.hoursUntilDue).toFixed(1)} hours overdue
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {equip.status.hoursUntilDue.toFixed(1)} hours until service
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
