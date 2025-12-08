/**
 * UI Components Usage Examples
 *
 * This file contains practical examples of how to use each UI component.
 * These examples can be copied and adapted for use in your screens.
 *
 * NOTE: This file is for reference only and should not be imported in production code.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Button,
  Input,
  Card,
  Badge,
  StatusBadge,
  EmptyState,
  LoadingSpinner,
  Avatar,
} from '@/components/ui';
import { theme } from '@/theme';

/**
 * Example 1: Button Variants
 */
export const ButtonExamples = () => {
  const [loading, setLoading] = useState(false);

  const handlePress = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Buttons</Text>

      {/* Primary Button */}
      <Button variant="primary" size="large" onPress={handlePress}>
        Primary Button
      </Button>

      {/* Secondary Button */}
      <Button variant="secondary" size="medium" onPress={handlePress}>
        Secondary Button
      </Button>

      {/* Outlined Button */}
      <Button variant="outlined" size="medium" onPress={handlePress}>
        Outlined Button
      </Button>

      {/* Text Button */}
      <Button variant="text" size="small" onPress={handlePress}>
        Text Button
      </Button>

      {/* Danger Button */}
      <Button variant="danger" size="medium" onPress={handlePress}>
        Delete
      </Button>

      {/* Button with Left Icon */}
      <Button
        variant="primary"
        leftIcon={<Ionicons name="add" size={20} color="white" />}
        onPress={handlePress}
      >
        Add Shop
      </Button>

      {/* Button with Right Icon */}
      <Button
        variant="secondary"
        rightIcon={<Ionicons name="arrow-forward" size={20} color="white" />}
        onPress={handlePress}
      >
        Continue
      </Button>

      {/* Loading Button */}
      <Button variant="primary" loading={loading} onPress={handlePress}>
        Submit
      </Button>

      {/* Disabled Button */}
      <Button variant="primary" disabled onPress={handlePress}>
        Disabled
      </Button>

      {/* Full Width Button */}
      <Button variant="primary" fullWidth onPress={handlePress}>
        Full Width Button
      </Button>
    </View>
  );
};

/**
 * Example 2: Input Fields
 */
export const InputExamples = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Inputs</Text>

      {/* Email Input */}
      <Input
        label="Email Address"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        leftIcon={<Ionicons name="mail-outline" size={20} color={theme.palette.text.secondary} />}
      />

      {/* Password Input */}
      <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.palette.text.secondary} />}
      />

      {/* Phone Input */}
      <Input
        label="Phone Number"
        placeholder="0712345678"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        leftIcon={<Ionicons name="call-outline" size={20} color={theme.palette.text.secondary} />}
        helperText="Enter your mobile number"
      />

      {/* Input with Error */}
      <Input
        label="Email"
        placeholder="email@example.com"
        value="invalid-email"
        onChangeText={() => {}}
        error="Please enter a valid email address"
        leftIcon={<Ionicons name="mail-outline" size={20} color={theme.palette.error.main} />}
      />

      {/* Multiline Input */}
      <Input
        label="Delivery Notes"
        placeholder="Enter any special instructions..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
      />

      {/* Disabled Input */}
      <Input
        label="Shop ID"
        placeholder="SHOP123"
        value="SHOP-12345"
        onChangeText={() => {}}
        disabled
      />
    </View>
  );
};

/**
 * Example 3: Cards
 */
export const CardExamples = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Cards</Text>

      {/* Default Card */}
      <Card variant="default">
        <Text style={styles.cardTitle}>Default Card</Text>
        <Text style={styles.cardText}>This is a default card with standard elevation.</Text>
      </Card>

      {/* Elevated Card */}
      <Card variant="elevated">
        <Text style={styles.cardTitle}>Elevated Card</Text>
        <Text style={styles.cardText}>This card has higher elevation for emphasis.</Text>
      </Card>

      {/* Outlined Card */}
      <Card variant="outlined">
        <Text style={styles.cardTitle}>Outlined Card</Text>
        <Text style={styles.cardText}>This card uses a border instead of shadow.</Text>
      </Card>

      {/* Pressable Card */}
      <Card
        variant="elevated"
        onPress={() => console.log('Card pressed')}
      >
        <View style={styles.shopCard}>
          <Avatar name="Mama Njeri Shop" size="medium" />
          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>Mama Njeri Shop</Text>
            <Text style={styles.shopLocation}>Westlands, Nairobi</Text>
            <StatusBadge status="pending" size="small" />
          </View>
        </View>
      </Card>
    </View>
  );
};

/**
 * Example 4: Badges
 */
export const BadgeExamples = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Badges</Text>

      <View style={styles.badgeRow}>
        <Badge variant="primary">Primary</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="success">Success</Badge>
      </View>

      <View style={styles.badgeRow}>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="info">Info</Badge>
      </View>

      <View style={styles.badgeRow}>
        <Badge variant="primary" size="small">Small</Badge>
        <Badge variant="primary" size="medium">Medium</Badge>
        <Badge variant="primary" size="large">Large</Badge>
      </View>

      <View style={styles.badgeRow}>
        <Badge variant="success" dot />
        <Badge variant="warning" dot />
        <Badge variant="error" dot />
      </View>
    </View>
  );
};

/**
 * Example 5: Status Badges
 */
export const StatusBadgeExamples = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Status Badges</Text>

      <Text style={styles.subsectionTitle}>Order Statuses</Text>
      <View style={styles.badgeRow}>
        <StatusBadge status="pending" />
        <StatusBadge status="confirmed" />
        <StatusBadge status="processing" />
      </View>

      <View style={styles.badgeRow}>
        <StatusBadge status="dispatched" />
        <StatusBadge status="in_transit" />
        <StatusBadge status="delivered" />
      </View>

      <View style={styles.badgeRow}>
        <StatusBadge status="cancelled" />
        <StatusBadge status="failed" />
      </View>

      <Text style={styles.subsectionTitle}>Route Statuses</Text>
      <View style={styles.badgeRow}>
        <StatusBadge status="pending" />
        <StatusBadge status="in_progress" />
        <StatusBadge status="completed" />
      </View>

      <Text style={styles.subsectionTitle}>Small Size</Text>
      <View style={styles.badgeRow}>
        <StatusBadge status="delivered" size="small" />
        <StatusBadge status="pending" size="small" />
      </View>
    </View>
  );
};

/**
 * Example 6: Empty States
 */
export const EmptyStateExamples = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Empty States</Text>

      {/* Empty Orders */}
      <EmptyState
        icon="file-tray-outline"
        title="No Orders Yet"
        description="You haven't placed any orders yet. Start by visiting shops in your route."
        actionLabel="View Routes"
        onAction={() => console.log('Navigate to routes')}
      />

      {/* Empty Shops */}
      <EmptyState
        icon="storefront-outline"
        title="No Shops Found"
        description="There are no shops in this area. Try expanding your search radius."
      />

      {/* Empty Notifications */}
      <EmptyState
        icon="notifications-outline"
        title="No Notifications"
        description="You're all caught up! Check back later for updates."
      />
    </View>
  );
};

/**
 * Example 7: Loading Spinners
 */
export const LoadingSpinnerExamples = () => {
  const [showFullscreen, setShowFullscreen] = useState(false);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Loading Spinners</Text>

      {/* Small Spinner */}
      <View style={styles.spinnerRow}>
        <Text>Small: </Text>
        <LoadingSpinner size="small" />
      </View>

      {/* Medium Spinner */}
      <View style={styles.spinnerRow}>
        <Text>Medium: </Text>
        <LoadingSpinner size="medium" />
      </View>

      {/* Large Spinner */}
      <View style={styles.spinnerRow}>
        <Text>Large: </Text>
        <LoadingSpinner size="large" />
      </View>

      {/* With Message */}
      <LoadingSpinner size="medium" message="Loading data..." />

      {/* Custom Color */}
      <LoadingSpinner size="medium" color={theme.palette.error.main} />

      {/* Fullscreen Toggle */}
      <Button
        variant="primary"
        onPress={() => {
          setShowFullscreen(true);
          setTimeout(() => setShowFullscreen(false), 2000);
        }}
      >
        Show Fullscreen Loader
      </Button>

      {showFullscreen && (
        <LoadingSpinner fullScreen size="large" message="Processing..." />
      )}
    </View>
  );
};

/**
 * Example 8: Avatars
 */
export const AvatarExamples = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Avatars</Text>

      {/* Different Sizes */}
      <View style={styles.avatarRow}>
        <Avatar name="John Doe" size="small" />
        <Avatar name="Jane Smith" size="medium" />
        <Avatar name="Bob Wilson" size="large" />
        <Avatar name="Alice Brown" size="xlarge" />
      </View>

      {/* With Status Badges */}
      <View style={styles.avatarRow}>
        <Avatar name="Online User" size="medium" badge="online" />
        <Avatar name="Busy User" size="medium" badge="busy" />
        <Avatar name="Offline User" size="medium" badge="offline" />
      </View>

      {/* With Images */}
      <View style={styles.avatarRow}>
        <Avatar
          source="https://i.pravatar.cc/150?img=1"
          name="User 1"
          size="medium"
        />
        <Avatar
          source="https://i.pravatar.cc/150?img=2"
          name="User 2"
          size="medium"
          badge="online"
        />
      </View>

      {/* Different Names (Different Colors) */}
      <View style={styles.avatarRow}>
        <Avatar name="Anna" size="medium" />
        <Avatar name="Ben" size="medium" />
        <Avatar name="Carol" size="medium" />
        <Avatar name="David" size="medium" />
      </View>
    </View>
  );
};

/**
 * Complete Example: Login Form
 */
export const LoginFormExample = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <Card variant="elevated">
        <Text style={styles.formTitle}>Sales Agent Login</Text>

        <Input
          label="Email"
          placeholder="agent@example.com"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          leftIcon={<Ionicons name="mail-outline" size={20} color={theme.palette.text.secondary} />}
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.palette.text.secondary} />}
        />

        <Button
          variant="primary"
          size="large"
          fullWidth
          loading={loading}
          onPress={handleLogin}
        >
          Sign In
        </Button>

        <Button variant="text" onPress={() => console.log('Forgot password')}>
          Forgot Password?
        </Button>
      </Card>
    </ScrollView>
  );
};

/**
 * Complete Example: Shop List
 */
export const ShopListExample = () => {
  const shops = [
    { id: '1', name: 'Mama Njeri Shop', location: 'Westlands', status: 'pending' as const },
    { id: '2', name: 'Kimathi Store', location: 'CBD', status: 'completed' as const },
    { id: '3', name: 'Valley Traders', location: 'Kilimani', status: 'in_progress' as const },
  ];

  return (
    <ScrollView style={styles.container}>
      {shops.map((shop) => (
        <Card
          key={shop.id}
          variant="elevated"
          onPress={() => console.log('Navigate to', shop.name)}
        >
          <View style={styles.shopCard}>
            <Avatar name={shop.name} size="large" />
            <View style={styles.shopInfo}>
              <Text style={styles.shopName}>{shop.name}</Text>
              <Text style={styles.shopLocation}>{shop.location}</Text>
              <StatusBadge status={shop.status} size="small" />
            </View>
          </View>
        </Card>
      ))}

      {shops.length === 0 && (
        <EmptyState
          icon="storefront-outline"
          title="No Shops Found"
          description="Start by adding shops to your route"
          actionLabel="Add Shop"
          onAction={() => console.log('Add shop')}
        />
      )}
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.palette.background.paper,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h5,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.md,
    fontWeight: '600',
  },
  subsectionTitle: {
    ...theme.typography.subtitle1,
    color: theme.palette.text.secondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  spinnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    ...theme.typography.h6,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.xs,
  },
  cardText: {
    ...theme.typography.body2,
    color: theme.palette.text.secondary,
  },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  shopInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  shopName: {
    ...theme.typography.subtitle1,
    color: theme.palette.text.primary,
    fontWeight: '600',
  },
  shopLocation: {
    ...theme.typography.body2,
    color: theme.palette.text.secondary,
  },
  formTitle: {
    ...theme.typography.h4,
    color: theme.palette.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    fontWeight: '700',
  },
});
