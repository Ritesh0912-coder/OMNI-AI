import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Text,
    Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
    Home,
    Search,
    Layers,
    User,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Bot
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function App() {
    const [url, setUrl] = useState('https://synapse-ai.com/browser');
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const webViewRef = useRef(null);

    const goBack = () => webViewRef.current?.goBack();
    const goForward = () => webViewRef.current?.goForward();
    const reload = () => webViewRef.current?.reload();
    const goHome = () => setUrl('https://synapse-ai.com/browser');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#050505" />

            {/* Search Header */}
            <View style={styles.header}>
                <View style={styles.searchBar}>
                    <Search size={14} color="#666" />
                    <Text style={styles.urlText} numberOfLines={1}>{url}</Text>
                    <Bot size={14} color="#00ff66" />
                </View>
            </View>

            {/* Main Browser View */}
            <View style={styles.webviewContainer}>
                <WebView
                    ref={webViewRef}
                    source={{ uri: url }}
                    style={styles.webview}
                    onNavigationStateChange={navState => {
                        setCanGoBack(navState.canGoBack);
                        setCanGoForward(navState.canGoForward);
                        setUrl(navState.url);
                    }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                />
            </View>

            {/* Bottom Navigation HUD */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={goBack} disabled={!canGoBack}>
                    <ChevronLeft size={24} color={canGoBack ? "#fff" : "#333"} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={goForward} disabled={!canGoForward}>
                    <ChevronRight size={24} color={canGoForward ? "#fff" : "#333"} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={goHome}>
                    <Home size={22} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={reload}>
                    <RotateCcw size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.navItem, styles.aiButton]}>
                    <Bot size={22} color="#000" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050505',
    },
    header: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#0a0a0a',
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 10,
    },
    urlText: {
        flex: 1,
        color: '#999',
        fontSize: 12,
        fontWeight: 'bold',
    },
    webviewContainer: {
        flex: 1,
    },
    webview: {
        flex: 1,
        backgroundColor: '#050505',
    },
    bottomNav: {
        flexDirection: 'row',
        height: 70,
        backgroundColor: '#0a0a0a',
        borderTopWidth: 1,
        borderTopColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
    },
    navItem: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiButton: {
        backgroundColor: '#00ff66',
        borderRadius: 14,
        width: 44,
        height: 44,
        shadowColor: '#00ff66',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    }
});
