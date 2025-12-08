// src/components/custom-popover/utils.ts
export const getPosition = (arrow: string) => {
	let anchorOrigin: any;
	let transformOrigin: any;
	let style: any = {};

	switch (arrow) {
		case 'top-left':
			anchorOrigin = { vertical: 'bottom', horizontal: 'left' };
			transformOrigin = { vertical: 'top', horizontal: 'left' };
			style = { marginTop: '8px' };
			break;
		case 'top-center':
			anchorOrigin = { vertical: 'bottom', horizontal: 'center' };
			transformOrigin = { vertical: 'top', horizontal: 'center' };
			style = { marginTop: '8px' };
			break;
		case 'top-right':
			anchorOrigin = { vertical: 'bottom', horizontal: 'right' };
			transformOrigin = { vertical: 'top', horizontal: 'right' };
			style = { marginTop: '8px' };
			break;
		case 'bottom-left':
			anchorOrigin = { vertical: 'top', horizontal: 'left' };
			transformOrigin = { vertical: 'bottom', horizontal: 'left' };
			style = { marginBottom: '8px' };
			break;
		case 'bottom-center':
			anchorOrigin = { vertical: 'top', horizontal: 'center' };
			transformOrigin = { vertical: 'bottom', horizontal: 'center' };
			style = { marginBottom: '8px' };
			break;
		case 'bottom-right':
			anchorOrigin = { vertical: 'top', horizontal: 'right' };
			transformOrigin = { vertical: 'bottom', horizontal: 'right' };
			style = { marginBottom: '8px' };
			break;
		default:
			anchorOrigin = { vertical: 'bottom', horizontal: 'right' };
			transformOrigin = { vertical: 'top', horizontal: 'right' };
			style = { marginTop: '8px' };
	}

	return { anchorOrigin, transformOrigin, style };
};

// src/components/custom-popover/styles.ts
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

interface StyledArrowProps {
	arrow: string;
}

export const StyledArrow = styled(Box)<StyledArrowProps>(({ theme, arrow }) => {
	const SIZE = 12;
	const POSITION = -(SIZE / 2);

	const topStyle = {
		borderRadius: '0 0 3px 0',
		top: POSITION,
		borderBottom: `solid 1px ${theme.palette.divider}`,
		borderRight: `solid 1px ${theme.palette.divider}`,
		transform: 'rotate(-135deg)',
	};

	const bottomStyle = {
		borderRadius: '3px 0 0 0',
		bottom: POSITION,
		borderTop: `solid 1px ${theme.palette.divider}`,
		borderLeft: `solid 1px ${theme.palette.divider}`,
		transform: 'rotate(-135deg)',
	};

	return {
		width: SIZE,
		height: SIZE,
		position: 'absolute',
		background: theme.palette.background.paper,
		zIndex: 1,
		...(arrow === 'top-left' && { left: 20, ...topStyle }),
		...(arrow === 'top-center' && { left: 0, right: 0, margin: 'auto', ...topStyle }),
		...(arrow === 'top-right' && { right: 20, ...topStyle }),
		...(arrow === 'bottom-left' && { left: 20, ...bottomStyle }),
		...(arrow === 'bottom-center' && { left: 0, right: 0, margin: 'auto', ...bottomStyle }),
		...(arrow === 'bottom-right' && { right: 20, ...bottomStyle }),
	};
});