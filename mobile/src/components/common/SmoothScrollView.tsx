import React from "react";
import {
    ScrollView,
    ScrollViewProps,
    FlatList,
    FlatListProps,
    Platform,
} from "react-native";

/**
 * Standard smooth scrolling configuration properties for React Native.
 * Ensures 60/120 FPS inertial physics, eliminates Android overscroll jank,
 * provides fluid iOS momentum bounce, and handles keyboard interactions smoothly.
 */
export const SMOOTH_SCROLL_PROPS: Partial<ScrollViewProps> = {
    showsVerticalScrollIndicator: false,
    showsHorizontalScrollIndicator: false,
    keyboardShouldPersistTaps: "handled",
    scrollEventThrottle: 16,
    decelerationRate: "normal",
    overScrollMode: Platform.OS === "android" ? "always" : "never",
    bounces: Platform.OS === "ios",
    nestedScrollEnabled: false,
    removeClippedSubviews: false,
};

export interface SmoothScrollViewProps extends ScrollViewProps {}

/**
 * High-performance, buttery-smooth ScrollView wrapper for Green-Hive pages.
 */
export const SmoothScrollView = React.forwardRef<ScrollView, SmoothScrollViewProps>(
    (props, ref) => {
        return (
            <ScrollView
                ref={ref}
                {...SMOOTH_SCROLL_PROPS}
                {...props}
            />
        );
    }
);

SmoothScrollView.displayName = "SmoothScrollView";

export interface SmoothFlatListProps<T> extends FlatListProps<T> {}

/**
 * High-performance, buttery-smooth FlatList wrapper for Green-Hive list pages.
 */
export function SmoothFlatList<T>(props: SmoothFlatListProps<T>) {
    return (
        <FlatList
            {...SMOOTH_SCROLL_PROPS}
            initialNumToRender={8}
            maxToRenderPerBatch={10}
            windowSize={7}
            {...props}
        />
    );
}

export default SmoothScrollView;
