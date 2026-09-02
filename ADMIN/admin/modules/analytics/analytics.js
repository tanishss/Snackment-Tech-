/* =========================================================
   SNACKMENT ADMIN
   ANALYTICS MODULE
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       1. ANALYTICS DATA
    ====================================================== */

    const analyticsData = {

        overview: {
            totalRevenue: 363900,
            totalOrders: 4218,
            averageOrderValue: 182,
            repeatRate: 68,

            changes: {
                revenue: "+22%",
                orders: "+17%",
                averageOrderValue: "+4%",
                repeatRate: "+9%"
            }
        },


        monthlyRevenue: {
            labels: [
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
                "Jan"
            ],

            values: [
                24800,
                26300,
                31000,
                29500,
                35000,
                32500
            ]
        },


        peakOrderHours: {
            labels: [
                "6am",
                "8am",
                "10am",
                "12pm",
                "2pm",
                "4pm",
                "6pm",
                "8pm",
                "10pm",
                "12am"
            ],

            values: [
                4,
                12,
                24,
                52,
                41,
                35,
                67,
                85,
                47,
                18
            ]
        },


        customerGrowth: {
            labels: [
                "W1",
                "W2",
                "W3",
                "W4",
                "W5",
                "W6"
            ],

            values: [
                820,
                960,
                1030,
                1080,
                1180,
                1280
            ]
        },


        categories: [
            {
                name: "Snacks",
                value: 38
            },
            {
                name: "Beverages",
                value: 24
            },
            {
                name: "Instant Food",
                value: 18
            },
            {
                name: "Chocolate",
                value: 12
            },
            {
                name: "Biscuits",
                value: 8
            }
        ],


        bestSellingProducts: [
            {
                name: "Lays Classic",
                units: 1420,
                revenue: 25560
            },
            {
                name: "Maggi Noodles",
                units: 1180,
                revenue: 16520
            },
            {
                name: "Kurkure Masala",
                units: 1040,
                revenue: 18720
            },
            {
                name: "Red Bull 250ml",
                units: 840,
                revenue: 100800
            },
            {
                name: "Dairy Milk Silk",
                units: 720,
                revenue: 64080
            }
        ]

    };


    /* =====================================================
       2. DOM REFERENCES
    ====================================================== */

    const elements = {

        page: document.getElementById("analytics-page"),

        totalRevenue:
            document.getElementById("analytics-total-revenue"),

        totalOrders:
            document.getElementById("analytics-total-orders"),

        averageOrderValue:
            document.getElementById("analytics-average-order-value"),

        repeatRate:
            document.getElementById("analytics-repeat-rate"),

        monthlyRevenueChart:
            document.getElementById("monthly-revenue-chart"),

        peakOrderHoursChart:
            document.getElementById("peak-order-hours-chart"),

        customerGrowthChart:
            document.getElementById("customer-growth-chart"),

        categoryChart:
            document.getElementById("category-chart"),

        categoryLegend:
            document.getElementById("analytics-category-legend"),

        bestProductsList:
            document.getElementById("analytics-best-products-list"),

        errorState:
            document.getElementById("analytics-error-state"),

        retryButton:
            document.getElementById("analytics-retry-button")

    };


    /* =====================================================
       3. STATE
    ====================================================== */

    const state = {

        initialized: false,

        resizeTimer: null,

        animationFrame: null,

        tooltip: {
            visible: false,
            x: 0,
            y: 0,
            text: ""
        },

        hoveredCategory: -1,

        hoveredBar: -1,

        hoveredRevenuePoint: -1,

        hoveredCustomerPoint: -1

    };


    /* =====================================================
       4. BASIC VALIDATION
    ====================================================== */

    function isAnalyticsPageAvailable() {

        return Boolean(elements.page);

    }


    function canvasExists(canvas) {

        return canvas instanceof HTMLCanvasElement;

    }


    /* =====================================================
       5. FORMATTERS
    ====================================================== */

    function formatCurrency(value) {

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(value);

    }


    function formatNumber(value) {

        return new Intl.NumberFormat("en-IN").format(value);

    }


    /* =====================================================
       6. UPDATE OVERVIEW
    ====================================================== */

    function renderOverview() {

        if (elements.totalRevenue) {

            elements.totalRevenue.textContent =
                formatCurrency(
                    analyticsData.overview.totalRevenue
                );

        }


        if (elements.totalOrders) {

            elements.totalOrders.textContent =
                formatNumber(
                    analyticsData.overview.totalOrders
                );

        }


        if (elements.averageOrderValue) {

            elements.averageOrderValue.textContent =
                formatCurrency(
                    analyticsData.overview.averageOrderValue
                );

        }


        if (elements.repeatRate) {

            elements.repeatRate.textContent =
                analyticsData.overview.repeatRate + "%";

        }

    }


    /* =====================================================
       7. CANVAS DPI / RESPONSIVE SETUP
    ====================================================== */

    function prepareCanvas(canvas) {

        if (!canvasExists(canvas)) {
            return null;
        }


        const rect = canvas.getBoundingClientRect();

        const width = Math.max(
            1,
            Math.floor(rect.width)
        );

        const height = Math.max(
            1,
            Math.floor(rect.height)
        );


        const dpr =
            Math.max(
                1,
                Math.min(
                    window.devicePixelRatio || 1,
                    2
                )
            );


        canvas.width =
            Math.floor(width * dpr);

        canvas.height =
            Math.floor(height * dpr);


        const context =
            canvas.getContext("2d");


        if (!context) {
            return null;
        }


        context.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );


        context.clearRect(
            0,
            0,
            width,
            height
        );


        return {
            ctx: context,
            width,
            height
        };

    }


    /* =====================================================
       8. DRAWING HELPERS
    ====================================================== */

    function roundedRect(
        ctx,
        x,
        y,
        width,
        height,
        radius
    ) {

        const r = Math.min(
            radius,
            width / 2,
            height / 2
        );


        ctx.beginPath();

        ctx.moveTo(
            x + r,
            y
        );

        ctx.lineTo(
            x + width - r,
            y
        );

        ctx.quadraticCurveTo(
            x + width,
            y,
            x + width,
            y + r
        );

        ctx.lineTo(
            x + width,
            y + height - r
        );

        ctx.quadraticCurveTo(
            x + width,
            y + height,
            x + width - r,
            y + height
        );

        ctx.lineTo(
            x + r,
            y + height
        );

        ctx.quadraticCurveTo(
            x,
            y + height,
            x,
            y + height - r
        );

        ctx.lineTo(
            x,
            y + r
        );

        ctx.quadraticCurveTo(
            x,
            y,
            x + r,
            y
        );

        ctx.closePath();

    }


    function drawText(
        ctx,
        text,
        x,
        y,
        options = {}
    ) {

        ctx.save();


        ctx.font =
            options.font ||
            "13px Arial";


        ctx.fillStyle =
            options.color ||
            "#777c82";


        ctx.textAlign =
            options.align ||
            "left";


        ctx.textBaseline =
            options.baseline ||
            "alphabetic";


        ctx.fillText(
            String(text),
            x,
            y
        );


        ctx.restore();

    }


    function drawLine(
        ctx,
        x1,
        y1,
        x2,
        y2,
        color = "#303438",
        width = 1
    ) {

        ctx.save();

        ctx.beginPath();

        ctx.moveTo(x1, y1);

        ctx.lineTo(x2, y2);

        ctx.strokeStyle = color;

        ctx.lineWidth = width;

        ctx.stroke();

        ctx.restore();

    }


    function getNiceMax(value) {

        if (value <= 0) {
            return 1;
        }


        const magnitude =
            Math.pow(
                10,
                Math.floor(
                    Math.log10(value)
                )
            );


        const normalized =
            value / magnitude;


        let nice;


        if (normalized <= 1) {
            nice = 1;
        } else if (normalized <= 2) {
            nice = 2;
        } else if (normalized <= 5) {
            nice = 5;
        } else {
            nice = 10;
        }


        return nice * magnitude;

    }


    function formatAxisValue(value) {

        if (value >= 1000) {

            const result =
                value / 1000;

            if (
                Number.isInteger(result)
            ) {
                return result + "k";
            }

            return result.toFixed(1) + "k";

        }


        return String(
            Math.round(value)
        );

    }


    /* =====================================================
       9. MONTHLY REVENUE CHART
    ====================================================== */

    function drawMonthlyRevenueChart() {

        const prepared =
            prepareCanvas(
                elements.monthlyRevenueChart
            );


        if (!prepared) {
            return;
        }


        const {
            ctx,
            width,
            height
        } = prepared;


        const labels =
            analyticsData.monthlyRevenue.labels;

        const values =
            analyticsData.monthlyRevenue.values;


        const padding = {
            top: 15,
            right: 5,
            bottom: 34,
            left: 45
        };


        const chartWidth =
            width -
            padding.left -
            padding.right;


        const chartHeight =
            height -
            padding.top -
            padding.bottom;


        const maxValue =
            getNiceMax(
                Math.max(...values)
            );


        const gridSteps = 4;


        /* -------------------------------------------------
           GRID
        -------------------------------------------------- */

        for (
            let i = 0;
            i <= gridSteps;
            i++
        ) {

            const ratio =
                i / gridSteps;


            const y =
                padding.top +
                chartHeight -
                ratio * chartHeight;


            drawLine(
                ctx,
                padding.left,
                y,
                width - padding.right,
                y,
                "#2d3134",
                1
            );


            const axisValue =
                maxValue * ratio;


            drawText(
                ctx,
                formatAxisValue(axisValue),
                padding.left - 9,
                y + 4,
                {
                    font: "12px Arial",
                    color: "#70757b",
                    align: "right"
                }
            );

        }


        /* -------------------------------------------------
           POINTS
        -------------------------------------------------- */

        const points = [];


        labels.forEach(
            (label, index) => {

                const ratio =
                    labels.length === 1
                        ? 0.5
                        : index /
                        (labels.length - 1);


                const x =
                    padding.left +
                    ratio * chartWidth;


                const valueRatio =
                    values[index] /
                    maxValue;


                const y =
                    padding.top +
                    chartHeight -
                    valueRatio * chartHeight;


                points.push({
                    x,
                    y,
                    value: values[index],
                    label
                });

            }
        );


        /* -------------------------------------------------
           AREA
        -------------------------------------------------- */

        if (points.length > 1) {

            const gradient =
                ctx.createLinearGradient(
                    0,
                    padding.top,
                    0,
                    padding.top + chartHeight
                );


            gradient.addColorStop(
                0,
                "rgba(89, 217, 79, 0.18)"
            );

            gradient.addColorStop(
                1,
                "rgba(89, 217, 79, 0.00)"
            );


            ctx.save();

            ctx.beginPath();

            ctx.moveTo(
                points[0].x,
                padding.top + chartHeight
            );

            points.forEach(
                (point) => {

                    ctx.lineTo(
                        point.x,
                        point.y
                    );

                }
            );


            ctx.lineTo(
                points[points.length - 1].x,
                padding.top + chartHeight
            );

            ctx.closePath();

            ctx.fillStyle = gradient;

            ctx.fill();

            ctx.restore();

        }


        /* -------------------------------------------------
           CURVE
        -------------------------------------------------- */

        ctx.save();

        ctx.beginPath();


        if (points.length) {

            ctx.moveTo(
                points[0].x,
                points[0].y
            );


            for (
                let i = 1;
                i < points.length;
                i++
            ) {

                const previous =
                    points[i - 1];

                const current =
                    points[i];


                const midpointX =
                    (
                        previous.x +
                        current.x
                    ) / 2;


                ctx.bezierCurveTo(
                    midpointX,
                    previous.y,
                    midpointX,
                    current.y,
                    current.x,
                    current.y
                );

            }

        }


        ctx.strokeStyle =
            "#59d94f";

        ctx.lineWidth = 2.2;

        ctx.lineJoin = "round";

        ctx.lineCap = "round";

        ctx.stroke();

        ctx.restore();


        /* -------------------------------------------------
           POINTS / HOVER
        -------------------------------------------------- */

        points.forEach(
            (point, index) => {

                if (
                    index ===
                    state.hoveredRevenuePoint
                ) {

                    ctx.save();

                    ctx.beginPath();

                    ctx.arc(
                        point.x,
                        point.y,
                        5,
                        0,
                        Math.PI * 2
                    );

                    ctx.fillStyle =
                        "#59d94f";

                    ctx.fill();

                    ctx.restore();

                }

            }
        );


        /* -------------------------------------------------
           X AXIS LABELS
        -------------------------------------------------- */

        labels.forEach(
            (label, index) => {

                const point =
                    points[index];


                drawText(
                    ctx,
                    label,
                    point.x,
                    height - 8,
                    {
                        font: "12px Arial",
                        color: "#70757b",
                        align: "center"
                    }
                );

            }
        );


        /* -------------------------------------------------
           TOOLTIP
        -------------------------------------------------- */

        if (
            state.hoveredRevenuePoint >= 0 &&
            points[state.hoveredRevenuePoint]
        ) {

            const point =
                points[state.hoveredRevenuePoint];


            drawTooltip(
                ctx,
                width,
                height,
                point.x,
                point.y,
                `${point.label}: ${formatCurrency(point.value)}`
            );

        }

    }


    /* =====================================================
       10. PEAK ORDER HOURS
    ====================================================== */

    function drawPeakOrderHoursChart() {

        const prepared =
            prepareCanvas(
                elements.peakOrderHoursChart
            );


        if (!prepared) {
            return;
        }


        const {
            ctx,
            width,
            height
        } = prepared;


        const labels =
            analyticsData.peakOrderHours.labels;

        const values =
            analyticsData.peakOrderHours.values;


        const padding = {
            top: 15,
            right: 2,
            bottom: 35,
            left: 35
        };


        const chartWidth =
            width -
            padding.left -
            padding.right;


        const chartHeight =
            height -
            padding.top -
            padding.bottom;


        const maxValue =
            getNiceMax(
                Math.max(...values)
            );


        const steps = 4;


        /* -------------------------------------------------
           GRID
        -------------------------------------------------- */

        for (
            let i = 0;
            i <= steps;
            i++
        ) {

            const ratio =
                i / steps;


            const y =
                padding.top +
                chartHeight -
                ratio * chartHeight;


            drawLine(
                ctx,
                padding.left,
                y,
                width - padding.right,
                y,
                "#2d3134",
                1
            );


            drawText(
                ctx,
                Math.round(
                    maxValue * ratio
                ),
                padding.left - 8,
                y + 4,
                {
                    font: "11px Arial",
                    color: "#70757b",
                    align: "right"
                }
            );

        }


        const slotWidth =
            chartWidth /
            labels.length;


        const barWidth =
            Math.min(
                18,
                slotWidth * 0.42
            );


        labels.forEach(
            (label, index) => {

                const value =
                    values[index];


                const barHeight =
                    (
                        value /
                        maxValue
                    ) * chartHeight;


                const x =
                    padding.left +
                    slotWidth * index +
                    (
                        slotWidth -
                        barWidth
                    ) / 2;


                const y =
                    padding.top +
                    chartHeight -
                    barHeight;


                const isHovered =
                    index ===
                    state.hoveredBar;


                ctx.save();


                roundedRect(
                    ctx,
                    x,
                    y,
                    barWidth,
                    barHeight,
                    5
                );


                ctx.fillStyle =
                    isHovered
                        ? "#4b9d4b"
                        : "#355c3b";


                ctx.fill();


                ctx.restore();


                drawText(
                    ctx,
                    label,
                    x + barWidth / 2,
                    height - 8,
                    {
                        font: "11px Arial",
                        color: "#70757b",
                        align: "center"
                    }
                );

            }
        );


        /* -------------------------------------------------
           TOOLTIP
        -------------------------------------------------- */

        if (
            state.hoveredBar >= 0 &&
            values[state.hoveredBar] !== undefined
        ) {

            const index =
                state.hoveredBar;


            const value =
                values[index];


            const x =
                padding.left +
                slotWidth * index +
                slotWidth / 2;


            const barHeight =
                (
                    value /
                    maxValue
                ) * chartHeight;


            const y =
                padding.top +
                chartHeight -
                barHeight;


            drawTooltip(
                ctx,
                width,
                height,
                x,
                y,
                `${labels[index]}: ${value} orders`
            );

        }

    }


    /* =====================================================
       11. CUSTOMER GROWTH CHART
    ====================================================== */

    function drawCustomerGrowthChart() {

        const prepared =
            prepareCanvas(
                elements.customerGrowthChart
            );


        if (!prepared) {
            return;
        }


        const {
            ctx,
            width,
            height
        } = prepared;


        const labels =
            analyticsData.customerGrowth.labels;

        const values =
            analyticsData.customerGrowth.values;


        const padding = {
            top: 18,
            right: 5,
            bottom: 36,
            left: 43
        };


        const chartWidth =
            width -
            padding.left -
            padding.right;


        const chartHeight =
            height -
            padding.top -
            padding.bottom;


        const maxValue =
            getNiceMax(
                Math.max(...values)
            );


        const steps = 4;


        /* -------------------------------------------------
           GRID
        -------------------------------------------------- */

        for (
            let i = 0;
            i <= steps;
            i++
        ) {

            const ratio =
                i / steps;


            const y =
                padding.top +
                chartHeight -
                ratio * chartHeight;


            drawLine(
                ctx,
                padding.left,
                y,
                width - padding.right,
                y,
                "#2d3134",
                1
            );


            drawText(
                ctx,
                formatAxisValue(
                    maxValue * ratio
                ),
                padding.left - 8,
                y + 4,
                {
                    font: "12px Arial",
                    color: "#70757b",
                    align: "right"
                }
            );

        }


        /* -------------------------------------------------
           POINTS
        -------------------------------------------------- */

        const points = [];


        labels.forEach(
            (label, index) => {

                const ratio =
                    labels.length === 1
                        ? 0.5
                        : index /
                        (labels.length - 1);


                const x =
                    padding.left +
                    ratio * chartWidth;


                const valueRatio =
                    values[index] /
                    maxValue;


                const y =
                    padding.top +
                    chartHeight -
                    valueRatio * chartHeight;


                points.push({
                    x,
                    y,
                    value: values[index],
                    label
                });

            }
        );


        /* -------------------------------------------------
           LINE
        -------------------------------------------------- */

        ctx.save();

        ctx.beginPath();


        if (points.length) {

            ctx.moveTo(
                points[0].x,
                points[0].y
            );


            for (
                let i = 1;
                i < points.length;
                i++
            ) {

                ctx.lineTo(
                    points[i].x,
                    points[i].y
                );

            }

        }


        ctx.strokeStyle =
            "#3f8df7";

        ctx.lineWidth = 2.2;

        ctx.lineJoin = "round";

        ctx.lineCap = "round";

        ctx.stroke();

        ctx.restore();


        /* -------------------------------------------------
           POINTS
        -------------------------------------------------- */

        points.forEach(
            (point, index) => {

                ctx.save();

                ctx.beginPath();

                ctx.arc(
                    point.x,
                    point.y,
                    index ===
                        state.hoveredCustomerPoint
                        ? 5
                        : 4,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    "#3f8df7";

                ctx.fill();

                ctx.restore();

            }
        );


        /* -------------------------------------------------
           X LABELS
        -------------------------------------------------- */

        labels.forEach(
            (label, index) => {

                drawText(
                    ctx,
                    label,
                    points[index].x,
                    height - 8,
                    {
                        font: "12px Arial",
                        color: "#70757b",
                        align: "center"
                    }
                );

            }
        );


        /* -------------------------------------------------
           TOOLTIP
        -------------------------------------------------- */

        if (
            state.hoveredCustomerPoint >= 0 &&
            points[state.hoveredCustomerPoint]
        ) {

            const point =
                points[
                state.hoveredCustomerPoint
                ];


            drawTooltip(
                ctx,
                width,
                height,
                point.x,
                point.y,
                `${point.label}: ${formatNumber(point.value)} customers`
            );

        }

    }


    /* =====================================================
       12. CATEGORY DONUT CHART
    ====================================================== */

    function drawCategoryChart() {

        const prepared =
            prepareCanvas(
                elements.categoryChart
            );


        if (!prepared) {
            return;
        }


        const {
            ctx,
            width,
            height
        } = prepared;


        const categories =
            analyticsData.categories;


        const centerX =
            width / 2;


        const centerY =
            height / 2;


        const radius =
            Math.min(
                width,
                height
            ) * 0.38;


        const innerRadius =
            radius * 0.58;


        const categoryColors = [
            "#61d957",
            "#3e86ee",
            "#e99a16",
            "#e14d92",
            "#8655e8"
        ];


        let currentAngle =
            -Math.PI / 2;


        categories.forEach(
            (category, index) => {

                const sliceAngle =
                    (
                        category.value /
                        100
                    ) * Math.PI * 2;


                const isHovered =
                    index ===
                    state.hoveredCategory;


                const offset =
                    isHovered
                        ? 5
                        : 0;


                const midAngle =
                    currentAngle +
                    sliceAngle / 2;


                const drawCenterX =
                    centerX +
                    Math.cos(midAngle) *
                    offset;


                const drawCenterY =
                    centerY +
                    Math.sin(midAngle) *
                    offset;


                ctx.save();


                ctx.beginPath();


                ctx.arc(
                    drawCenterX,
                    drawCenterY,
                    radius,
                    currentAngle,
                    currentAngle + sliceAngle
                );


                ctx.arc(
                    drawCenterX,
                    drawCenterY,
                    innerRadius,
                    currentAngle + sliceAngle,
                    currentAngle,
                    true
                );


                ctx.closePath();


                ctx.fillStyle =
                    categoryColors[index];


                ctx.fill();


                ctx.strokeStyle =
                    "#222527";

                ctx.lineWidth = 2;

                ctx.stroke();


                ctx.restore();


                currentAngle +=
                    sliceAngle;

            }
        );


        /* -------------------------------------------------
           CENTER
        -------------------------------------------------- */

        ctx.save();


        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            innerRadius - 1,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#222527";

        ctx.fill();


        ctx.restore();


        /* -------------------------------------------------
           TOOLTIP
        -------------------------------------------------- */

        if (
            state.hoveredCategory >= 0 &&
            categories[state.hoveredCategory]
        ) {

            const category =
                categories[
                state.hoveredCategory
                ];


            drawTooltip(
                ctx,
                width,
                height,
                centerX,
                centerY,
                `${category.name}: ${category.value}%`
            );

        }

    }


    /* =====================================================
       13. TOOLTIP
    ====================================================== */

    function drawTooltip(
        ctx,
        width,
        height,
        x,
        y,
        text
    ) {

        ctx.save();


        const font =
            "600 12px Arial";


        ctx.font = font;


        const textWidth =
            ctx.measureText(text).width;


        const boxWidth =
            textWidth + 20;


        const boxHeight =
            30;


        let boxX =
            x -
            boxWidth / 2;


        let boxY =
            y -
            boxHeight -
            12;


        if (
            boxX < 5
        ) {
            boxX = 5;
        }


        if (
            boxX + boxWidth >
            width - 5
        ) {

            boxX =
                width -
                boxWidth -
                5;

        }


        if (
            boxY < 5
        ) {

            boxY =
                y + 12;

        }


        roundedRect(
            ctx,
            boxX,
            boxY,
            boxWidth,
            boxHeight,
            7
        );


        ctx.fillStyle =
            "#111315";


        ctx.strokeStyle =
            "#3b4044";


        ctx.lineWidth = 1;


        ctx.fill();

        ctx.stroke();


        drawText(
            ctx,
            text,
            boxX + boxWidth / 2,
            boxY + 19,
            {
                font,
                color: "#f0f1f2",
                align: "center"
            }
        );


        ctx.restore();

    }


    /* =====================================================
       14. CATEGORY LEGEND
    ====================================================== */

    function renderCategoryLegend() {

        if (!elements.categoryLegend) {
            return;
        }


        const categories =
            analyticsData.categories;


        const colors = [
            "#61d957",
            "#3e86ee",
            "#e99a16",
            "#e14d92",
            "#8655e8"
        ];


        elements.categoryLegend.innerHTML =
            categories.map(
                (category, index) => {

                    return `
                        <div class="analytics-category-legend-item">

                            <div class="analytics-category-legend-name">

                                <span
                                    class="analytics-category-dot"
                                    style="background:${colors[index]};"
                                    aria-hidden="true"
                                ></span>

                                <span>
                                    ${escapeHtml(category.name)}
                                </span>

                            </div>

                            <strong>
                                ${category.value}%
                            </strong>

                        </div>
                    `;

                }
            ).join("");

    }


    /* =====================================================
       15. BEST PRODUCTS
    ====================================================== */

    function renderBestProducts() {

        if (!elements.bestProductsList) {
            return;
        }


        const products =
            analyticsData.bestSellingProducts;


        elements.bestProductsList.innerHTML =
            products.map(
                (product) => {

                    return `
                        <div class="analytics-best-product-item">

                            <div class="analytics-best-product-info">

                                <h3 class="analytics-best-product-name">
                                    ${escapeHtml(product.name)}
                                </h3>

                                <p class="analytics-best-product-meta">
                                    ${formatNumber(product.units)} units sold
                                </p>

                            </div>

                            <strong class="analytics-best-product-revenue">
                                ${formatCurrency(product.revenue)}
                            </strong>

                        </div>
                    `;

                }
            ).join("");

    }


    /* =====================================================
       16. HTML ESCAPE
    ====================================================== */

    function escapeHtml(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    /* =====================================================
       17. DRAW ALL CHARTS
    ====================================================== */

    function drawAllCharts() {

        if (!isAnalyticsPageAvailable()) {
            return;
        }


        drawMonthlyRevenueChart();

        drawPeakOrderHoursChart();

        drawCustomerGrowthChart();

        drawCategoryChart();

    }


    /* =====================================================
       18. RENDER EVERYTHING
    ====================================================== */

    function renderAnalytics() {

        renderOverview();

        renderCategoryLegend();

        renderBestProducts();

        drawAllCharts();

    }


    /* =====================================================
       19. MONTHLY REVENUE HIT TEST
    ====================================================== */

    function getRevenuePointAt(
        canvas,
        event
    ) {

        const rect =
            canvas.getBoundingClientRect();


        const x =
            event.clientX -
            rect.left;


        const y =
            event.clientY -
            rect.top;


        const labels =
            analyticsData.monthlyRevenue.labels;


        const values =
            analyticsData.monthlyRevenue.values;


        const padding = {
            top: 15,
            right: 5,
            bottom: 34,
            left: 45
        };


        const chartWidth =
            rect.width -
            padding.left -
            padding.right;


        const chartHeight =
            rect.height -
            padding.top -
            padding.bottom;


        const maxValue =
            getNiceMax(
                Math.max(...values)
            );


        for (
            let i = 0;
            i < labels.length;
            i++
        ) {

            const ratio =
                labels.length === 1
                    ? 0.5
                    : i /
                    (labels.length - 1);


            const pointX =
                padding.left +
                ratio * chartWidth;


            const valueRatio =
                values[i] /
                maxValue;


            const pointY =
                padding.top +
                chartHeight -
                valueRatio * chartHeight;


            const distance =
                Math.sqrt(
                    Math.pow(
                        x - pointX,
                        2
                    ) +
                    Math.pow(
                        y - pointY,
                        2
                    )
                );


            if (distance <= 12) {

                return i;

            }

        }


        return -1;

    }


    /* =====================================================
       20. PEAK BAR HIT TEST
    ====================================================== */

    function getPeakBarAt(
        canvas,
        event
    ) {

        const rect =
            canvas.getBoundingClientRect();


        const mouseX =
            event.clientX -
            rect.left;


        const mouseY =
            event.clientY -
            rect.top;


        const labels =
            analyticsData.peakOrderHours.labels;


        const values =
            analyticsData.peakOrderHours.values;


        const padding = {
            top: 15,
            right: 2,
            bottom: 35,
            left: 35
        };


        const chartWidth =
            rect.width -
            padding.left -
            padding.right;


        const chartHeight =
            rect.height -
            padding.top -
            padding.bottom;


        const maxValue =
            getNiceMax(
                Math.max(...values)
            );


        const slotWidth =
            chartWidth /
            labels.length;


        const barWidth =
            Math.min(
                18,
                slotWidth * 0.42
            );


        for (
            let index = 0;
            index < values.length;
            index++
        ) {

            const barHeight =
                (
                    values[index] /
                    maxValue
                ) * chartHeight;


            const x =
                padding.left +
                slotWidth * index +
                (
                    slotWidth -
                    barWidth
                ) / 2;


            const y =
                padding.top +
                chartHeight -
                barHeight;


            if (
                mouseX >= x &&
                mouseX <= x + barWidth &&
                mouseY >= y &&
                mouseY <=
                padding.top +
                chartHeight
            ) {

                return index;

            }

        }


        return -1;

    }


    /* =====================================================
       21. CUSTOMER GROWTH HIT TEST
    ====================================================== */

    function getCustomerPointAt(
        canvas,
        event
    ) {

        const rect =
            canvas.getBoundingClientRect();


        const x =
            event.clientX -
            rect.left;


        const y =
            event.clientY -
            rect.top;


        const labels =
            analyticsData.customerGrowth.labels;


        const values =
            analyticsData.customerGrowth.values;


        const padding = {
            top: 18,
            right: 5,
            bottom: 36,
            left: 43
        };


        const chartWidth =
            rect.width -
            padding.left -
            padding.right;


        const chartHeight =
            rect.height -
            padding.top -
            padding.bottom;


        const maxValue =
            getNiceMax(
                Math.max(...values)
            );


        for (
            let i = 0;
            i < labels.length;
            i++
        ) {

            const ratio =
                labels.length === 1
                    ? 0.5
                    : i /
                    (labels.length - 1);


            const pointX =
                padding.left +
                ratio * chartWidth;


            const valueRatio =
                values[i] /
                maxValue;


            const pointY =
                padding.top +
                chartHeight -
                valueRatio * chartHeight;


            const distance =
                Math.sqrt(
                    Math.pow(
                        x - pointX,
                        2
                    ) +
                    Math.pow(
                        y - pointY,
                        2
                    )
                );


            if (distance <= 14) {

                return i;

            }

        }


        return -1;

    }


    /* =====================================================
       22. CATEGORY HIT TEST
    ====================================================== */

    function getCategoryAt(
        canvas,
        event
    ) {

        const rect =
            canvas.getBoundingClientRect();


        const x =
            event.clientX -
            rect.left;


        const y =
            event.clientY -
            rect.top;


        const centerX =
            rect.width / 2;


        const centerY =
            rect.height / 2;


        const distance =
            Math.sqrt(
                Math.pow(
                    x - centerX,
                    2
                ) +
                Math.pow(
                    y - centerY,
                    2
                )
            );


        const radius =
            Math.min(
                rect.width,
                rect.height
            ) * 0.38;


        const innerRadius =
            radius * 0.58;


        if (
            distance <
            innerRadius ||
            distance >
            radius + 8
        ) {

            return -1;

        }


        let angle =
            Math.atan2(
                y - centerY,
                x - centerX
            );


        angle +=
            Math.PI / 2;


        if (angle < 0) {
            angle += Math.PI * 2;
        }


        let accumulated = 0;


        for (
            let i = 0;
            i < analyticsData.categories.length;
            i++
        ) {

            const slice =
                (
                    analyticsData.categories[i].value /
                    100
                ) * Math.PI * 2;


            if (
                angle >= accumulated &&
                angle <=
                accumulated + slice
            ) {

                return i;

            }


            accumulated += slice;

        }


        return -1;

    }


    /* =====================================================
       23. MOUSE HANDLERS
    ====================================================== */

    function attachCanvasInteractions() {

        const revenueCanvas =
            elements.monthlyRevenueChart;


        if (canvasExists(revenueCanvas)) {

            revenueCanvas.addEventListener(
                "mousemove",
                function (event) {

                    const index =
                        getRevenuePointAt(
                            revenueCanvas,
                            event
                        );


                    if (
                        state.hoveredRevenuePoint !==
                        index
                    ) {

                        state.hoveredRevenuePoint =
                            index;

                        drawMonthlyRevenueChart();

                    }

                }
            );


            revenueCanvas.addEventListener(
                "mouseleave",
                function () {

                    state.hoveredRevenuePoint =
                        -1;

                    drawMonthlyRevenueChart();

                }
            );

        }


        const peakCanvas =
            elements.peakOrderHoursChart;


        if (canvasExists(peakCanvas)) {

            peakCanvas.addEventListener(
                "mousemove",
                function (event) {

                    const index =
                        getPeakBarAt(
                            peakCanvas,
                            event
                        );


                    if (
                        state.hoveredBar !==
                        index
                    ) {

                        state.hoveredBar =
                            index;

                        drawPeakOrderHoursChart();

                    }

                }
            );


            peakCanvas.addEventListener(
                "mouseleave",
                function () {

                    state.hoveredBar =
                        -1;

                    drawPeakOrderHoursChart();

                }
            );

        }


        const customerCanvas =
            elements.customerGrowthChart;


        if (canvasExists(customerCanvas)) {

            customerCanvas.addEventListener(
                "mousemove",
                function (event) {

                    const index =
                        getCustomerPointAt(
                            customerCanvas,
                            event
                        );


                    if (
                        state.hoveredCustomerPoint !==
                        index
                    ) {

                        state.hoveredCustomerPoint =
                            index;

                        drawCustomerGrowthChart();

                    }

                }
            );


            customerCanvas.addEventListener(
                "mouseleave",
                function () {

                    state.hoveredCustomerPoint =
                        -1;

                    drawCustomerGrowthChart();

                }
            );

        }


        const categoryCanvas =
            elements.categoryChart;


        if (canvasExists(categoryCanvas)) {

            categoryCanvas.addEventListener(
                "mousemove",
                function (event) {

                    const index =
                        getCategoryAt(
                            categoryCanvas,
                            event
                        );


                    if (
                        state.hoveredCategory !==
                        index
                    ) {

                        state.hoveredCategory =
                            index;

                        drawCategoryChart();

                    }

                }
            );


            categoryCanvas.addEventListener(
                "mouseleave",
                function () {

                    state.hoveredCategory =
                        -1;

                    drawCategoryChart();

                }
            );

        }

    }


    /* =====================================================
       24. RESPONSIVE RESIZE
    ====================================================== */

    function attachResizeHandler() {

        window.addEventListener(
            "resize",
            function () {

                clearTimeout(
                    state.resizeTimer
                );


                state.resizeTimer =
                    setTimeout(
                        function () {

                            drawAllCharts();

                        },
                        120
                    );

            }
        );

    }


    /* =====================================================
       25. ERROR HANDLING
    ====================================================== */

    function showAnalyticsError() {

        if (elements.errorState) {

            elements.errorState.classList.remove(
                "hidden"
            );

        }

    }


    function hideAnalyticsError() {

        if (elements.errorState) {

            elements.errorState.classList.add(
                "hidden"
            );

        }

    }


    function attachRetryHandler() {

        if (!elements.retryButton) {
            return;
        }


        elements.retryButton.addEventListener(
            "click",
            function () {

                hideAnalyticsError();

                initializeAnalytics();

            }
        );

    }


    /* =====================================================
       26. PUBLIC DATA UPDATE HELPERS
    ====================================================== */

    function updateOverview(newData) {

        if (!newData) {
            return;
        }


        if (
            typeof newData.totalRevenue ===
            "number"
        ) {

            analyticsData.overview.totalRevenue =
                newData.totalRevenue;

        }


        if (
            typeof newData.totalOrders ===
            "number"
        ) {

            analyticsData.overview.totalOrders =
                newData.totalOrders;

        }


        if (
            typeof newData.averageOrderValue ===
            "number"
        ) {

            analyticsData.overview.averageOrderValue =
                newData.averageOrderValue;

        }


        if (
            typeof newData.repeatRate ===
            "number"
        ) {

            analyticsData.overview.repeatRate =
                newData.repeatRate;

        }


        renderOverview();

    }


    /* =====================================================
       27. FUTURE BACKEND DATA HOOK
    ====================================================== */

    async function loadAnalyticsData() {

        const token =
            localStorage.getItem("snackmentAdminToken");

        if (!token) {

            throw new Error(
                "Admin authentication token not found."
            );

        }


        const response =
            await fetch(
                "http://localhost:5001/api/admin/analytics",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        let result;

        try {

            result =
                await response.json();

        } catch (error) {

            throw new Error(
                "Invalid response from analytics server."
            );

        }


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Failed to load analytics."
            );

        }


        const data =
            result.data;


        /* =====================================================
           OVERVIEW
        ====================================================== */

        analyticsData.overview = {

            totalRevenue:
                Number(
                    data.overview?.totalRevenue || 0
                ),

            totalOrders:
                Number(
                    data.overview?.totalOrders || 0
                ),

            averageOrderValue:
                Number(
                    data.overview?.averageOrderValue || 0
                ),

            repeatRate:
                Number(
                    data.overview?.repeatRate || 0
                ),

            changes: {

                revenue:
                    data.today?.changes?.revenue ||
                    "0%",

                orders:
                    data.today?.changes?.orders ||
                    "0%",

                averageOrderValue:
                    data.today?.changes?.averageOrderValue ||
                    "0%",

                repeatRate:
                    "0%"

            }

        };


        /* =====================================================
           MONTHLY REVENUE
        ====================================================== */

        analyticsData.monthlyRevenue = {

            labels:
                Array.isArray(data.monthlyRevenue)
                    ? data.monthlyRevenue.map(
                        item => item.label
                    )
                    : [],

            values:
                Array.isArray(data.monthlyRevenue)
                    ? data.monthlyRevenue.map(
                        item => Number(item.value || 0)
                    )
                    : []

        };


        /* =====================================================
           PEAK ORDER HOURS
        ====================================================== */

        analyticsData.peakOrderHours = {

            labels:
                Array.isArray(data.peakOrderHours)
                    ? data.peakOrderHours.map(
                        item => item.label
                    )
                    : [],

            values:
                Array.isArray(data.peakOrderHours)
                    ? data.peakOrderHours.map(
                        item => Number(item.value || 0)
                    )
                    : []

        };


        /* =====================================================
           CUSTOMER GROWTH
        ====================================================== */

        analyticsData.customerGrowth = {

            labels:
                Array.isArray(data.customerGrowth)
                    ? data.customerGrowth.map(
                        item => item.label
                    )
                    : [],

            values:
                Array.isArray(data.customerGrowth)
                    ? data.customerGrowth.map(
                        item => Number(item.value || 0)
                    )
                    : []

        };


        /* =====================================================
           CATEGORIES
        ====================================================== */

        /*
         * Backend currently returns:
         *
         * categories: null
         *
         * Therefore we keep the existing frontend categories
         * until category analytics is connected in backend.
         */

        if (Array.isArray(data.categories)) {

            analyticsData.categories =
                data.categories.map(
                    category => ({
                        name:
                            category.name,

                        value:
                            Number(
                                category.value || 0
                            )
                    })
                );

        }


        /* =====================================================
           BEST SELLING PRODUCTS
        ====================================================== */

        analyticsData.bestSellingProducts =
            Array.isArray(
                data.bestSellingProducts
            )

                ? data.bestSellingProducts.map(
                    product => ({

                        name:
                            product.name ||
                            product.productId ||
                            "Unknown Product",

                        units:
                            Number(
                                product.units || 0
                            ),

                        revenue:
                            Number(
                                product.revenue || 0
                            )

                    })
                )

                : [];


        console.log(
            "[Snackment Analytics] Backend data loaded successfully."
        );

    }


    /* =====================================================
       28. INITIALIZATION
    ====================================================== */

    async function initializeAnalytics() {

        if (!isAnalyticsPageAvailable()) {

            console.warn(
                "Snackment Analytics: #analytics-page not found."
            );

            return;

        }


        try {

            hideAnalyticsError();


            await loadAnalyticsData();


            renderAnalytics();


            if (!state.initialized) {

                attachCanvasInteractions();

                attachResizeHandler();

                attachRetryHandler();

                state.initialized = true;

            }

        } catch (error) {

            console.error(
                "Snackment Analytics failed to initialize:",
                error
            );


            showAnalyticsError();

        }

    }


    /* =====================================================
       29. MODULE API
    ====================================================== */

    window.SnackmentAnalytics = {

        init: initializeAnalytics,

        render: renderAnalytics,

        updateOverview,

        data: analyticsData

    };


    /* =====================================================
       30. AUTO INIT
    ====================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeAnalytics,
            {
                once: true
            }
        );

    } else {

        initializeAnalytics();

    }


})();