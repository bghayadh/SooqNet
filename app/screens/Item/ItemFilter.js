import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    TextInput,
    Keyboard,
    useWindowDimensions,
} from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

const COLOR_CATEGORIES = [
    "Black",
    "Blue",
    "Red",
    "Green",
    "Yellow",
    "Beige",
    "Gold",
    "Silver",
    "Brown",
    "Orange",
    "Pink",
    "Purple",
    "White",
    "Grey",
    "Multicolor",
];

// English and Arabic keywords are both checked because the API can return
// either name (and older rows sometimes only have the Arabic one).
const COLOR_KEYWORDS = {
    Black: ["black", "أسود", "اسود"],
    Blue: ["blue", "أزرق", "ازرق"],
    Red: ["red", "أحمر", "احمر"],
    Green: ["green", "أخضر", "اخضر"],
    Yellow: ["yellow", "أصفر", "اصفر"],
    Beige: ["beige", "بيج"],
    Gold: ["gold", "ذهبي"],
    Silver: ["silver", "فضي"],
    Brown: ["brown", "بني"],
    Orange: ["orange", "برتقالي"],
    Pink: ["pink", "وردي", "زهري"],
    Purple: ["purple", "بنفسجي"],
    White: ["white", "أبيض", "ابيض"],
    Grey: ["grey", "gray", "رمادي"],
    Multicolor: ["multicolor", "multi", "متعدد"],
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const extractColorOption = (option) => {
    let english = "";
    let arabic = "";

    if (Array.isArray(option)) {
        // The API returns [ITEM_CODE, COLOR_NAME] or
        // [ITEM_CODE, COLOR_NAME, ARABIC_COLOR_NAME].
        english = typeof option[1] === "string" ? option[1].trim() : "";
        arabic = typeof option[2] === "string" ? option[2].trim() : "";
    } else if (option && typeof option === "object") {
        english = String(
            option.COLOR_NAME ?? option.colorName ?? option.name ?? "",
        ).trim();
        arabic = String(
            option.ARABIC_COLOR_NAME ?? option.arabicColorName ?? "",
        ).trim();
    } else if (typeof option === "string") {
        english = option.trim();
    }

    return {
        // The value sent to the server must stay the name stored in
        // ITEM_COLORS.COLOR_NAME, so prefer the English name.
        value: english || arabic,
        english,
        arabic,
    };
};

const findColorCategory = (text) => {
    const searchable = String(text || "").toLowerCase();
    if (!searchable) return "Multicolor";

    for (const category of COLOR_CATEGORIES) {
        const keywords = COLOR_KEYWORDS[category] || [];
        if (keywords.some((keyword) => searchable.includes(keyword))) {
            return category;
        }
    }
    return "Multicolor";
};

const categorizeColors = (colorsArray) => {
    const categorized = {};
    COLOR_CATEGORIES.forEach((category) => {
        categorized[category] = [];
    });

    if (!Array.isArray(colorsArray)) return categorized;

    colorsArray.forEach((option) => {
        const { value, english, arabic } = extractColorOption(option);
        if (!value) return;

        const category = findColorCategory(`${english} ${arabic}`);
        if (!categorized[category].includes(value)) {
            categorized[category].push(value);
        }
    });

    return categorized;
};

const ItemFilter = ({
    onSortChange,
    selectedSort,
    onDropdownToggle,
    isDropdownOpen = false,
    sizeOptions = [],
    selectedSizes = [],
    onSizeChange,
    colorsOptions = [],
    selectedColors = [],
    onColorChange,
    onRangeChange,
    selectedPriceRange = [0, 0],
    maxPrice = 0,
    currency = "",
}) => {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [range, setRange] = useState([0, 0]);
    const [minInput, setMinInput] = useState("0");
    const [maxInput, setMaxInput] = useState("0");
    const [priceRowWidth, setPriceRowWidth] = useState(0);
    const minFocused = useRef(false);
    const maxFocused = useRef(false);
    const lastCommittedRange = useRef(null);

    const { t } = useTranslation();
    const { height: screenHeight, width: screenWidth } = useWindowDimensions();

    const lang = i18next.language;
    const isRTL = lang === "ar";

    const sortOptions = [
        "Name A to Z",
        "Name Z to A",
        "Price Low to High",
        "Price High to Low",
    ];

    const sliderMax = Math.max(0, Math.ceil(Number(maxPrice) || 0));
    // Measure the row instead of hard-coding 200px: this keeps the slider
    // fully visible on 320px phones and still uses the full width on tablets.
    const sliderLength = Math.max(
        140,
        Math.round((priceRowWidth || screenWidth) - 40),
    );

    const sortedColors = useMemo(
        () => categorizeColors(colorsOptions),
        [colorsOptions],
    );

    // Keep the slider and the text fields in sync when the parent resets the
    // range (category change) or the maximum changes after a fetch.
    useEffect(() => {
        if (!Array.isArray(selectedPriceRange) || selectedPriceRange.length !== 2) {
            return;
        }

        const nextMin = clamp(Number(selectedPriceRange[0]) || 0, 0, sliderMax);
        const nextMax = clamp(Number(selectedPriceRange[1]) || 0, 0, sliderMax);
        setRange([nextMin, nextMax]);

        if (!minFocused.current) setMinInput(String(nextMin));
        if (!maxFocused.current) setMaxInput(String(nextMax));
    }, [selectedPriceRange, sliderMax]);

    // The overlay in ItemView closes the dropdown by setting this to false.
    useEffect(() => {
        if (!isDropdownOpen) setActiveDropdown(null);
    }, [isDropdownOpen]);

    const handleSizeToggle = (size) => {
        const updatedSizes = selectedSizes.includes(size)
            ? selectedSizes.filter((s) => s !== size)
            : [...selectedSizes, size];
        onSizeChange(updatedSizes);
    };

    const toggleDropdown = (dropdownType) => {
        const nextDropdown =
            activeDropdown === dropdownType ? null : dropdownType;
        setActiveDropdown(nextDropdown);
        onDropdownToggle(nextDropdown !== null);
    };

    const handleSortSelect = (option) => {
        onSortChange(option);
        setActiveDropdown(null);
        onDropdownToggle(false);
    };

    const handleColorToggle = (colorKey) => {
        const colorElements = sortedColors[colorKey] || [];
        const isSelected = selectedColors.some((el) =>
            colorElements.includes(el),
        );

        const updatedColors = isSelected
            ? selectedColors.filter((el) => !colorElements.includes(el))
            : [...selectedColors, ...colorElements];

        onColorChange(updatedColors);
    };

    const applyRange = (values) => {
        const nextRange = [
            clamp(Math.round(values[0]), 0, sliderMax),
            clamp(Math.round(values[1]), 0, sliderMax),
        ];
        const rangeKey = `${nextRange[0]}:${nextRange[1]}`;

        setRange(nextRange);
        setMinInput(String(nextRange[0]));
        setMaxInput(String(nextRange[1]));

        if (lastCommittedRange.current === rangeKey) return;
        lastCommittedRange.current = rangeKey;
        onRangeChange(nextRange);
    };

    const handleValuesChange = (values) => {
        const nextRange = [
            clamp(Math.round(values[0]), 0, sliderMax),
            clamp(Math.round(values[1]), 0, sliderMax),
        ];
        setRange(nextRange);
        // While dragging, the fields must follow the markers.
        setMinInput(String(nextRange[0]));
        setMaxInput(String(nextRange[1]));
    };

    const handleValuesChangeFinish = (values) => {
        applyRange(values);
    };

    const handleMinChange = (text) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        setMinInput(cleaned);

        const value = cleaned === "" ? null : parseInt(cleaned, 10);
        // Update the slider live, but only for a valid min <= current max.
        if (value !== null && value <= range[1] && value <= sliderMax) {
            setRange([value, range[1]]);
        }
    };

    const handleMaxChange = (text) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        setMaxInput(cleaned);

        const value = cleaned === "" ? null : parseInt(cleaned, 10);
        // Update the slider live, but only for a valid max >= current min.
        if (value !== null && value >= range[0] && value <= sliderMax) {
            setRange([range[0], value]);
        }
    };

    const parseInput = (text) => {
        const value = parseInt(String(text).replace(/[^0-9]/g, ""), 10);
        return Number.isFinite(value) ? value : null;
    };

    const commitInputs = (editedField) => {
        let min = parseInput(minInput);
        let max = parseInput(maxInput);

        if (min === null) min = 0;
        if (max === null) max = sliderMax;

        min = clamp(min, 0, sliderMax);
        max = clamp(max, 0, sliderMax);

        // Keep the edited field inside the other bound instead of allowing
        // min > max (the slider cannot represent that state).
        if (min > max) {
            if (editedField === "min") min = max;
            else max = min;
        }

        applyRange([min, max]);
    };

    const handleMinBlur = () => {
        minFocused.current = false;
        commitInputs("min");
    };

    const handleMaxBlur = () => {
        maxFocused.current = false;
        commitInputs("max");
    };

    const dropdownMaxHeight = Math.min(screenHeight * 0.5, 340);

    return (
        <View style={styles.container}>
            {/* Filter buttons: horizontally scrollable on narrow screens */}
            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={styles.scrollContainer}
                contentContainerStyle={styles.chipRow}
            >
                <View
                    style={{
                        flexDirection: isRTL ? "row-reverse" : "row",
                        flexWrap: "nowrap",
                    }}
                >
                    {/* Sort By filter button */}
                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                {
                                    flexDirection: isRTL
                                        ? "row-reverse"
                                        : "row",
                                },
                            ]}
                            onPress={() => toggleDropdown("sort")}
                        >
                            <Text style={styles.filterText}>
                                {t("sortby")}{" "}
                            </Text>
                            <Icon
                                name={
                                    activeDropdown === "sort" ? "up" : "down"
                                }
                                size={14}
                                color="black"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Size filter button */}
                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                {
                                    flexDirection: isRTL
                                        ? "row-reverse"
                                        : "row",
                                },
                            ]}
                            onPress={() => toggleDropdown("size")}
                        >
                            <Text style={styles.filterText}>{t("size")} </Text>
                            <Icon
                                name={activeDropdown === "size" ? "up" : "down"}
                                size={14}
                                color="black"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Color filter button */}
                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                {
                                    flexDirection: isRTL
                                        ? "row-reverse"
                                        : "row",
                                },
                            ]}
                            onPress={() => toggleDropdown("color")}
                        >
                            <Text style={styles.filterText}>{t("color")} </Text>
                            <Icon
                                name={
                                    activeDropdown === "color" ? "up" : "down"
                                }
                                size={14}
                                color="black"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Price: full-width row, independent from the filter chips */}
            {sliderMax > 0 && (
                <View
                    style={styles.priceRow}
                    onLayout={(event) =>
                        setPriceRowWidth(event.nativeEvent.layout.width)
                    }
                >
                    <View
                        style={[
                            styles.priceHeader,
                            {
                                flexDirection: isRTL
                                    ? "row-reverse"
                                    : "row",
                            },
                        ]}
                    >
                        <Text style={styles.priceTitle}>
                            {currency
                                ? `${t("price")} (${currency})`
                                : t("priceusd")}
                        </Text>

                        <View
                            style={[
                                styles.priceInputs,
                                {
                                    flexDirection: isRTL
                                        ? "row-reverse"
                                        : "row",
                                },
                            ]}
                        >
                            <TextInput
                                style={[
                                    styles.priceInput,
                                    {
                                        textAlign: isRTL ? "right" : "left",
                                    },
                                ]}
                                value={minInput}
                                onChangeText={handleMinChange}
                                onFocus={() => {
                                    minFocused.current = true;
                                }}
                                onBlur={handleMinBlur}
                                onSubmitEditing={() => Keyboard.dismiss()}
                                keyboardType="number-pad"
                                returnKeyType="done"
                                maxLength={7}
                                selectTextOnFocus
                                placeholder={t("min")}
                                placeholderTextColor="#999"
                            />
                            <Text style={styles.priceDash}>–</Text>
                            <TextInput
                                style={[
                                    styles.priceInput,
                                    {
                                        textAlign: isRTL ? "right" : "left",
                                    },
                                ]}
                                value={maxInput}
                                onChangeText={handleMaxChange}
                                onFocus={() => {
                                    maxFocused.current = true;
                                }}
                                onBlur={handleMaxBlur}
                                onSubmitEditing={() => Keyboard.dismiss()}
                                keyboardType="number-pad"
                                returnKeyType="done"
                                maxLength={7}
                                selectTextOnFocus
                                placeholder={t("max")}
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    <MultiSlider
                        values={range}
                        sliderLength={sliderLength}
                        onValuesChange={handleValuesChange}
                        onValuesChangeFinish={handleValuesChangeFinish}
                        min={0}
                        max={sliderMax}
                        step={1}
                        allowOverlap={false}
                        snapped
                        containerStyle={styles.sliderContainer}
                        trackStyle={styles.sliderTrack}
                        selectedStyle={styles.sliderSelected}
                        unselectedStyle={styles.sliderUnselected}
                        markerStyle={styles.sliderMarker}
                        pressedMarkerStyle={styles.sliderMarkerPressed}
                    />

                    <View
                        style={[
                            styles.priceBounds,
                            {
                                flexDirection: isRTL
                                    ? "row-reverse"
                                    : "row",
                            },
                        ]}
                    >
                        <Text style={styles.boundText}>0</Text>
                        <Text style={styles.boundText}>{sliderMax}</Text>
                    </View>
                </View>
            )}

            {/* One responsive dropdown panel, anchored below the chips row */}
            {activeDropdown && (
                <View
                    style={[styles.dropdown, { maxHeight: dropdownMaxHeight }]}
                >
                    {activeDropdown === "sort" ? (
                        <ScrollView
                            contentContainerStyle={styles.scrollableDropdown}
                            keyboardShouldPersistTaps="handled"
                        >
                            {sortOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleSortSelect(option)}
                                    style={[
                                        styles.optionContainer,
                                        {
                                            flexDirection: isRTL
                                                ? "row-reverse"
                                                : "row",
                                        },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.radioButton,
                                            isRTL
                                                ? {
                                                      marginLeft: 5,
                                                      marginRight: -10,
                                                  }
                                                : {
                                                      marginLeft: -10,
                                                      marginRight: 5,
                                                  },
                                        ]}
                                    >
                                        {selectedSort === option && (
                                            <View
                                                style={
                                                    styles.radioButtonSelected
                                                }
                                            />
                                        )}
                                    </View>
                                    <Text style={styles.optionText}>
                                        {t(option)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : activeDropdown === "size" ? (
                        <ScrollView
                            contentContainerStyle={{ flexGrow: 1 }}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled={true}
                        >
                            {sizeOptions.length === 0 ? (
                                <Text style={styles.emptyText}>
                                    {t("noOptionsAvailable")}
                                </Text>
                            ) : (
                                <View style={styles.sizeOptionsContainer}>
                                    {sizeOptions.map((size, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() =>
                                                handleSizeToggle(size)
                                            }
                                            style={[
                                                styles.sizeOption,
                                                selectedSizes.includes(size) &&
                                                    styles.selectedFilterOption,
                                            ]}
                                        >
                                            <Text style={styles.sizeText}>
                                                {size}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </ScrollView>
                    ) : (
                        <ScrollView
                            contentContainerStyle={{ flexGrow: 1 }}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled={true}
                        >
                            {Object.values(sortedColors).every(
                                (colors) => colors.length === 0,
                            ) ? (
                                <Text style={styles.emptyText}>
                                    {t("noColorsAvailable")}
                                </Text>
                            ) : (
                                <View
                                    style={[
                                        styles.colorOptionsContainer,
                                        {
                                            flexDirection: isRTL
                                                ? "row-reverse"
                                                : "row",
                                        },
                                    ]}
                                >
                                    {COLOR_CATEGORIES.map(
                                        (colorKey) =>
                                            sortedColors[colorKey].length >
                                                0 && (
                                                <TouchableOpacity
                                                    key={colorKey}
                                                    onPress={() =>
                                                        handleColorToggle(
                                                            colorKey,
                                                        )
                                                    }
                                                    style={[
                                                        styles.colorOption,
                                                        selectedColors.some(
                                                            (el) =>
                                                                sortedColors[
                                                                    colorKey
                                                                ].includes(el),
                                                        ) &&
                                                            styles.selectedFilterOption,
                                                        {
                                                            flexDirection: isRTL
                                                                ? "row-reverse"
                                                                : "row",
                                                        },
                                                    ]}
                                                >
                                                    {colorKey ===
                                                    "Multicolor" ? (
                                                        <Image
                                                            source={require("../../Images/multicolor.gif")}
                                                            style={
                                                                styles.multicolorImage
                                                            }
                                                            resizeMode="contain"
                                                        />
                                                    ) : (
                                                        <View
                                                            style={[
                                                                styles.colorSwatch,
                                                                {
                                                                    backgroundColor:
                                                                        colorKey.toLowerCase(),
                                                                },
                                                            ]}
                                                        />
                                                    )}
                                                    <Text
                                                        style={styles.colorText}
                                                    >
                                                        {t(colorKey)}
                                                    </Text>
                                                </TouchableOpacity>
                                            ),
                                    )}
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        zIndex: 10000,
    },
    scrollContainer: {
        backgroundColor: "white",
        flexGrow: 0,
    },
    chipRow: {
        paddingVertical: 4,
        paddingHorizontal: 2,
    },
    filterContainer: {
        marginRight: 10,
    },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        height: 40,
        minWidth: 90,
        paddingHorizontal: 12,
        borderRadius: 6,
        justifyContent: "center",
    },
    filterText: {
        fontSize: 18,
        color: "black",
    },
    priceRow: {
        paddingHorizontal: 4,
        paddingTop: 6,
        paddingBottom: 2,
        backgroundColor: "white",
    },
    priceHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        rowGap: 8,
    },
    priceTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
    },
    priceInputs: {
        flexDirection: "row",
        alignItems: "center",
        columnGap: 6,
    },
    priceInput: {
        height: 36,
        minWidth: 68,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 0,
        fontSize: 14,
        color: "#333",
        backgroundColor: "#FAFAFA",
    },
    priceDash: {
        fontSize: 14,
        color: "#777",
    },
    sliderContainer: {
        alignSelf: "center",
        height: 44,
        marginTop: 2,
    },
    sliderTrack: {
        height: 4,
        borderRadius: 2,
        backgroundColor: "#E0E0E0",
    },
    sliderSelected: {
        backgroundColor: "#71797E",
    },
    sliderUnselected: {
        backgroundColor: "#E0E0E0",
    },
    sliderMarker: {
        height: 20,
        width: 20,
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#71797E",
    },
    sliderMarkerPressed: {
        backgroundColor: "#EFEBE0",
    },
    priceBounds: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 6,
        marginTop: -8,
    },
    boundText: {
        fontSize: 12,
        color: "#777",
    },
    dropdown: {
        position: "absolute",
        top: 48,
        left: 0,
        right: 0,
        backgroundColor: "white",
        padding: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        zIndex: 2000,
        elevation: 10,
        overflow: "hidden",
    },
    sizeOptionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        alignContent: "flex-start",
        rowGap: 15,
        marginHorizontal: 5,
    },
    sizeOption: {
        width: "22%",
        aspectRatio: 2.5,
        borderWidth: 1,
        borderColor: "#ddd",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        height: 80,
        marginLeft: 5,
    },
    selectedFilterOption: {
        backgroundColor: "#BEBEBE",
        borderColor: "black",
    },
    sizeText: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
        textAlign: "center",
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "black",
        justifyContent: "center",
        alignItems: "center",
    },
    radioButtonSelected: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#0096FF",
    },
    optionContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 10,
        width: "auto",
    },
    optionText: {
        fontSize: 16,
    },
    scrollableDropdown: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    colorOptionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        alignContent: "flex-start",
        rowGap: 10,
        marginHorizontal: 5,
    },
    colorSwatch: {
        width: 20,
        height: 20,
        borderRadius: 2,
        marginRight: 5,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    colorOption: {
        flexDirection: "row",
        alignItems: "center",
        width: "30%",
        aspectRatio: 3,
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 1,
        justifyContent: "flex-start",
        backgroundColor: "#FFFFFF",
        height: 40,
        marginLeft: 5,
        marginBottom: 10,
    },
    multicolorImage: {
        width: 20,
        height: 20,
        marginRight: 5,
        borderRadius: 2,
    },
    colorText: {
        fontSize: 12,
        color: "#333",
        fontWeight: "500",
        textAlign: "center",
        marginHorizontal: 2,
    },
    emptyText: {
        fontSize: 14,
        color: "#777",
        textAlign: "center",
        paddingVertical: 16,
    },
});

export default ItemFilter;
