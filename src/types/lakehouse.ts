export interface LakehouseApi {
  idLakehouse: string;
  lakehouseDisplayName: string;
  tables: string[];
}

export interface SelectedTable {
  name: string;
  projectName: string;
}

export interface SelectedLakehouse {
  lakehouseName: string;
  idLakehouse: string;
  tables: SelectedTable[];
}
