import pandas as pd
import os
import json 

file_path = "data_tokped.csv"
output_dir = "data_json"

print("Memuat dan mempersiapkan data...")
if not os.path.exists(file_path):
    print(f"Error: File data '{file_path}' tidak ditemukan.")
else:
    try:
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        df = pd.read_csv(
            file_path, 
            sep=';', 
            parse_dates=['order_date'], 
            dayfirst=True
        )

        df.dropna(subset=['order_date'], inplace=True)
        df['after_discount'] = pd.to_numeric(df['after_discount'], errors='coerce')
        df.dropna(subset=['after_discount'], inplace=True)

        df['year_month'] = df['order_date'].dt.to_period('M')
        print("Data berhasil dimuat.")

        print("Menyiapkan data tren bulanan...")
        monthly_sales = df.groupby('year_month')['after_discount'].sum().reset_index()
        monthly_sales['year_month'] = monthly_sales['year_month'].astype(str)
        monthly_sales.to_json(
            os.path.join(output_dir, "monthly_sales.json"), 
            orient="records"
        )

        print("Menyiapkan data top kategori...")
        top_categories = df.groupby('category')['after_discount'].sum().sort_values(ascending=False).head(10).reset_index()
        top_categories.to_json(
            os.path.join(output_dir, "top_categories.json"), 
            orient="records"
        )

        print("Menyiapkan data metode pembayaran...")
        payment_counts = df['payment_method'].value_counts()
        top_3_payments = payment_counts.head(3).copy() 
        others_sum = payment_counts.iloc[3:].sum()
        
        if others_sum > 0:
            top_3_payments.loc['Lain-lain'] = others_sum
            
        payment_data = top_3_payments.reset_index()
        payment_data.columns = ['method', 'count']
        payment_data.to_json(
            os.path.join(output_dir, "payment_methods.json"), 
            orient="records"
        )

        print("Menyiapkan data heatmap...")
        top_5_cat_names = df.groupby('category')['after_discount'].sum().nlargest(5).index
        df_top5 = df[df['category'].isin(top_5_cat_names)]
        
        heatmap_data = df_top5.pivot_table(
            index='category',
            columns='year_month',
            values='after_discount',
            aggfunc='sum'
        ).fillna(0) 
        
        heatmap_final_data = []
        for category in heatmap_data.index:
            series_data = []
            for month in heatmap_data.columns:
                series_data.append({
                    "x": str(month),
                    "y": float(heatmap_data.loc[category, month]) 
                })
            heatmap_final_data.append({
                "name": category,
                "data": series_data
            })
            
        heatmap_export = {
            "series": heatmap_final_data
        }
        
        with open(os.path.join(output_dir, "heatmap_data.json"), 'w') as f:
            json.dump(heatmap_export, f) 

        print(f"\nSemua data JSON telah disimpan di folder '{output_dir}'.")

    except Exception as e:
        print(f"Terjadi error saat memproses data: {e}")