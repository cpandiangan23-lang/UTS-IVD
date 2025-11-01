document.addEventListener('DOMContentLoaded', () => {

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    let currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : 'light';

    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        if (darkModeToggle) {
            darkModeToggle.checked = true;
        }
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            
            currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);

            if (window.dashboardCharts) {
                Object.values(window.dashboardCharts).forEach(chart => {
                    chart.updateOptions({
                        theme: {
                            mode: currentTheme
                        }
                    });
                });
            }
        });
    }

    window.dashboardCharts = {};

    const formatRupiah = (value) => {
        if (!value && value !== 0) return 'Rp 0'; 
        if (value >= 1e9) {
            return 'Rp ' + (value / 1e9).toFixed(1) + ' M';
        }
        if (value >= 1e6) {
            return 'Rp ' + (value / 1e6).toFixed(1) + ' Jt';
        }
        if (value >= 1e3) {
            return 'Rp ' + (value / 1e3).toFixed(0) + ' Rb';
        }
        return 'Rp ' + value.toLocaleString('id-ID');
    };

    const formatAngka = (value) => {
        if (!value && value !== 0) return '0';
        if (value >= 1e9) {
            return (value / 1e9).toFixed(1) + ' M';
        }
        if (value >= 1e6) {
            return (value / 1e6).toFixed(1) + ' Jt';
        }
        if (value >= 1e3) {
            return (value / 1e3).toFixed(0) + ' Rb';
        }
        return value.toLocaleString('id-ID');
    };

    const formatAxisAngka = (value) => {
        if (value >= 1e9) {
            return (value / 1e9).toFixed(0) + ' M';
        }
        if (value >= 1e6) {
            return (value / 1e6).toFixed(0) + ' Jt';
        }
        if (value === 0) {
            return '0';
        }
        return value.toLocaleString('id-ID');
    };

    async function renderMonthlySalesChart() {
        try {
            const response = await fetch('data_json/monthly_sales.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            const series = [{
                name: "Total Penjualan",
                data: data.map(item => item.after_discount)
            }];
            const categories = data.map(item => item.year_month);

            const options = {
                chart: {
                    type: 'area', 
                    height: 350,
                    zoom: { enabled: false },
                    toolbar: { show: true, tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false } },
                    fontFamily: 'Inter, sans-serif'
                },
                series: series,
                colors: ['#0fc6d3ff'],
                fill: {
                    type: 'gradient',
                    gradient: {
                        shadeIntensity: 1,
                        opacityFrom: 0.7,
                        opacityTo: 0.3,
                        stops: [0, 90, 100]
                    }
                },
                xaxis: {
                    categories: categories,
                },
                yaxis: {
                    labels: {
                        formatter: (value) => formatRupiah(value)
                    }
                },
                tooltip: {
                    y: {
                        formatter: (value) => formatRupiah(value)
                    }
                },
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 3 }, 
                theme: {
                    mode: currentTheme 
                }
            };

            const chart = new ApexCharts(document.querySelector("#chart-tren-bulanan"), options);
            chart.render();
            window.dashboardCharts.monthlySales = chart; 
        } catch (error) {
            console.error("Gagal memuat chart tren bulanan:", error);
            document.querySelector("#chart-tren-bulanan").innerHTML = "Gagal memuat data chart. Cek console (F12).";
        }
    }

    async function renderTopCategoriesChart() {
        try {
            const response = await fetch('data_json/top_categories.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            const options = {
                chart: {
                    type: 'bar',
                    height: 400,
                    toolbar: { show: false },
                    fontFamily: 'Inter, sans-serif'
                },
                series: [{
                    name: 'Total Keuntungan',
                    data: data.map(item => item.after_discount)
                }],
                colors: ['#008FFB'], 
                xaxis: {
                    categories: data.map(item => item.category),
                    labels: {
                        formatter: (value) => formatAngka(value)
                    },
                    title: {
                        text: 'Total Keuntungan (Rupiah)',
                        style: {
                            fontWeight: 600
                        }
                    }
                },
                yaxis: {
                    title: {
                        text: 'Kategori Produk',
                        style: {
                            fontWeight: 600
                        }
                    }
                },
                plotOptions: {
                    bar: {
                        horizontal: true, 
                        barHeight: '70%',
                    }
                },
                grid: {
                    xaxis: {
                        lines: {
                            show: true
                        }
                    },
                    yaxis: {
                        lines: {
                            show: false
                        }
                    }
                },
                legend: { show: false },
                dataLabels: {
                    enabled: false, 
                },
                tooltip: {
                    y: {
                        formatter: (value) => formatRupiah(value)
                    }
                },
                theme: {
                    mode: currentTheme
                }
            };

            const chart = new ApexCharts(document.querySelector("#chart-top-kategori"), options);
            chart.render();
            window.dashboardCharts.topCategories = chart;
        } catch (error) {
            console.error("Gagal memuat chart top kategori:", error);
            document.querySelector("#chart-top-kategori").innerHTML = "Gagal memuat data chart. Cek console (F12).";
        }
    }

    async function renderPaymentMethodsChart() {
        try {
            const response = await fetch('data_json/payment_methods.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            const options = {
                chart: {
                    type: 'donut',
                    height: 400,
                    fontFamily: 'Inter, sans-serif'
                },
                colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560'], 
                series: data.map(item => item['count']), 
                labels: data.map(item => item.method),
                dataLabels: {
                    enabled: true,
                    formatter: function (val) {
                        return val.toFixed(1) + "%"
                    },
                    style: {
                        fontSize: '14px',
                        fontWeight: 'bold',
                    },
                    dropShadow: {
                        enabled: false,
                    }
                },
                legend: {
                    position: 'bottom',
                    formatter: function(seriesName, opts) {
                        const count = opts.w.globals.series[opts.seriesIndex];
                        const formattedCount = count.toLocaleString('id-ID'); 
                        return seriesName + ": " + formattedCount;
                    }
                },
                responsive: [{
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: '100%'
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }],
                theme: {
                    mode: currentTheme
                }
            };

            const chart = new ApexCharts(document.querySelector("#chart-metode-pembayaran"), options);
            chart.render();
            window.dashboardCharts.paymentMethods = chart;
        } catch (error) {
            console.error("Gagal memuat chart metode pembayaran:", error);
            document.querySelector("#chart-metode-pembayaran").innerHTML = "Gagal memuat data chart. Cek console (F12).";
        }
    }

    async function renderHeatmapChart() {
        try {
            const response = await fetch('data_json/heatmap_data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json(); 

            const categories = data.series[0].data.map(item => item.x);
            
            const options = {
                chart: {
                    type: 'heatmap',
                    height: 350,
                    toolbar: { show: true },
                    fontFamily: 'Inter, sans-serif'
                },
                series: data.series, 
                
                xaxis: {
                    categories: categories, 
                    labels: {
                        formatter: function(value) {
                            if (!value) return value;
                            try {
                                const parts = value.split('-');
                                const date = new Date(parts[0], parts[1] - 1, 1);
                                
                                const month = date.toLocaleString('id-ID', { month: 'short' });
                                const year = date.getFullYear().toString().substr(-2);
                                return month + " '" + year;

                            } catch (e) {
                                return value;
                            }
                        },
                        style: {
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '10px'
                        }
                    }
                },
                
                plotOptions: {
                    heatmap: {
                        colorScale: {
                            ranges: [
                                { from: 0, to: 100000, color: '#00A100', name: '< 100rb' },
                                { from: 100001, to: 10000000, color: '#128FD9', name: '100rb - 10jt' },
                                { from: 10000001, to: 50000000, color: '#FFB200', name: '10jt - 50jt' },
                                { from: 50000001, to: 1000000000, color: '#FF0000', name: '> 50jt' }
                            ]
                        }
                    }
                },
                dataLabels: {
                    enabled: false, 
                },
                tooltip: {
                    y: {
                        formatter: (value) => formatRupiah(value)
                    }
                },
                theme: {
                    mode: currentTheme
                }
            };

            const chart = new ApexCharts(document.querySelector("#chart-heatmap-penjualan"), options);
            chart.render();
            window.dashboardCharts.heatmap = chart;
        } catch (error) {
            console.error("Gagal memuat chart heatmap:", error);
            document.querySelector("#chart-heatmap-penjualan").innerHTML = "Gagal memuat data chart. Cek console (F12).";
        }
    }

    renderMonthlySalesChart();
    renderTopCategoriesChart();
    renderPaymentMethodsChart();
    renderHeatmapChart();
    
});