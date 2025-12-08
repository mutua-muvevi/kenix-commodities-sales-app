# Layout Components - Quick Reference Card

## Import
```typescript
import { ScreenWrapper, SafeArea, Container, Header } from '@/components/layout';
```

## ScreenWrapper - Use for 90% of Screens

### Basic
```typescript
<ScreenWrapper headerTitle="Title">
  <Content />
</ScreenWrapper>
```

### Scrollable
```typescript
<ScreenWrapper headerTitle="Title" scrollable>
  <Content />
</ScreenWrapper>
```

### With Refresh
```typescript
<ScreenWrapper
  headerTitle="Title"
  scrollable
  onRefresh={handleRefresh}
  refreshing={isRefreshing}
>
  <Content />
</ScreenWrapper>
```

### With Back Button
```typescript
<ScreenWrapper headerTitle="Title" showBackButton>
  <Content />
</ScreenWrapper>
```

### With Actions
```typescript
<ScreenWrapper
  headerTitle="Title"
  showBackButton
  rightAction={<IconButton />}
>
  <Content />
</ScreenWrapper>
```

### Form Screen
```typescript
<ScreenWrapper
  headerTitle="Title"
  showBackButton
  keyboardAvoiding
  scrollable
>
  <Form />
</ScreenWrapper>
```

## SafeArea - Custom Layouts

### Basic
```typescript
<SafeArea>
  <Content />
</SafeArea>
```

### Top Only
```typescript
<SafeArea edges={['top']}>
  <Content />
</SafeArea>
```

### Custom Background
```typescript
<SafeArea backgroundColor="#22c55e">
  <Content />
</SafeArea>
```

## Container - Padding

### Default (Medium)
```typescript
<Container>
  <Content />
</Container>
```

### Sizes
```typescript
<Container padding="none">    {/* 0px */}
<Container padding="small">   {/* 8px */}
<Container padding="medium">  {/* 16px */}
<Container padding="large">   {/* 24px */}
```

### Centered
```typescript
<Container centered>
  <Content />
</Container>
```

## Header - Navigation

### Basic
```typescript
<Header title="Title" />
```

### With Back
```typescript
<Header title="Title" showBackButton />
```

### With Subtitle
```typescript
<Header
  title="Shop Details"
  subtitle="ABC Store"
  showBackButton
/>
```

### With Actions
```typescript
<Header
  title="Title"
  showBackButton
  rightAction={
    <TouchableOpacity onPress={handleEdit}>
      <Ionicons name="create-outline" size={24} />
    </TouchableOpacity>
  }
/>
```

### Transparent
```typescript
<Header title="Title" transparent />
```

## Common Props

### ScreenWrapper
| Prop | Type | Default |
|------|------|---------|
| `headerTitle` | string | undefined |
| `scrollable` | boolean | false |
| `showBackButton` | boolean | false |
| `keyboardAvoiding` | boolean | true |
| `tabBarPadding` | boolean | true |
| `padding` | string | 'medium' |
| `refreshing` | boolean | false |
| `onRefresh` | function | undefined |
| `rightAction` | ReactNode | undefined |

### SafeArea
| Prop | Type | Default |
|------|------|---------|
| `edges` | Edge[] | ['top','bottom','left','right'] |
| `backgroundColor` | string | theme color |

### Container
| Prop | Type | Default |
|------|------|---------|
| `padding` | string | 'medium' |
| `centered` | boolean | false |

### Header
| Prop | Type | Default |
|------|------|---------|
| `title` | string | required |
| `subtitle` | string | undefined |
| `showBackButton` | boolean | false |
| `rightAction` | ReactNode | undefined |
| `transparent` | boolean | false |

## Common Patterns

### Dashboard
```typescript
<ScreenWrapper
  headerTitle="Dashboard"
  scrollable
  onRefresh={refresh}
  refreshing={loading}
>
```

### Details
```typescript
<ScreenWrapper
  headerTitle="Details"
  showBackButton
  scrollable
  rightAction={<EditButton />}
>
```

### Form
```typescript
<ScreenWrapper
  headerTitle="Register"
  showBackButton
  keyboardAvoiding
  scrollable
>
```

### Map
```typescript
<SafeArea edges={['top']}>
  <MapView />
  <Header title="Map" transparent />
</SafeArea>
```

## Tips

1. **Use ScreenWrapper** for most screens
2. **Set tabBarPadding={false}** for modals
3. **Use scrollable** for long content
4. **Add onRefresh** for data fetching
5. **Use keyboardAvoiding** for forms
6. **Custom layouts** use SafeArea + Container
7. **Theme colors** applied automatically
