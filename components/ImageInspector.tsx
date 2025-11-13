import React, { useRef, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

const MIN_SCALE = 0.2;
const MAX_SCALE = 8;
const MARKER_RADIUS = 15; // Visual radius on screen

export const ImageInspector = ({ imagePath, markers, onAddMarker, selectedMarker, onSelectMarker }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [objectUrl, setObjectUrl] = useState(null);
  const [transform, setTransform] = useState({ scale: 1, offsetX: 0, offsetY: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef(undefined);
  const pulseRadius = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(transform.offsetX, transform.offsetY);
    ctx.scale(transform.scale, transform.scale);
    ctx.drawImage(imageRef.current, 0, 0);
    
    if (selectedMarker) {
      const POPUP_PADDING = 10 / transform.scale;
      const FONT_SIZE = 14 / transform.scale;
      const LINE_HEIGHT = 18 / transform.scale;
      const POPUP_OFFSET = 25 / transform.scale;

      ctx.font = `normal ${FONT_SIZE}px sans-serif`;
      const commentLines = selectedMarker.comment.split('\n');
      const authorText = `Par: ${selectedMarker.author}`;
      const dateText = new Date(selectedMarker.timestamp).toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      
      const lines = [...commentLines, authorText, dateText];
      let maxWidth = 0;
      lines.forEach(line => {
        const width = ctx.measureText(line).width;
        if (width > maxWidth) {
          maxWidth = width;
        }
      });

      const popupWidth = maxWidth + POPUP_PADDING * 2;
      const popupHeight = (LINE_HEIGHT * lines.length) + POPUP_PADDING * 2;
      let popupX = selectedMarker.x + POPUP_OFFSET;
      let popupY = selectedMarker.y - popupHeight - POPUP_OFFSET / 2;

      ctx.fillStyle = 'rgba(17, 24, 39, 0.9)';
      ctx.strokeStyle = 'rgba(239, 68, 68, 1)';
      ctx.lineWidth = 2 / transform.scale;
      ctx.beginPath();
      ctx.rect(popupX, popupY, popupWidth, popupHeight);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      lines.forEach((line, index) => {
        ctx.fillText(line, popupX + POPUP_PADDING, popupY + POPUP_PADDING + (index * LINE_HEIGHT));
      });
    }

    markers.forEach(marker => {
      const isSelected = marker.id === selectedMarker?.id;

      if (isSelected) {
          ctx.beginPath();
          ctx.arc(marker.x, marker.y, (MARKER_RADIUS / transform.scale) + pulseRadius.current, 0, 2 * Math.PI);
          const pulseOpacity = 1 - (pulseRadius.current / (15 / transform.scale));
          ctx.strokeStyle = `rgba(239, 68, 68, ${pulseOpacity})`;
          ctx.lineWidth = 3 / transform.scale;
          ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(marker.x, marker.y, MARKER_RADIUS / transform.scale, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.7)';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2 / transform.scale;
      ctx.stroke();

      ctx.fillStyle = 'white';
      ctx.font = `bold ${16 / transform.scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(marker.id), marker.x, marker.y);
    });

    ctx.restore();
  }, [transform, markers, selectedMarker]);
  
  const resetTransform = useCallback((canvas, image) => {
    const scaleX = canvas.width / image.width;
    const scaleY = canvas.height / image.height;
    const scale = Math.min(scaleX, scaleY) * 0.95;
    const offsetX = (canvas.width - image.width * scale) / 2;
    const offsetY = (canvas.height - image.height * scale) / 2;
    setTransform({ scale, offsetX, offsetY });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        if (canvasRef.current && imageRef.current) {
          const currentCanvas = canvasRef.current;
          currentCanvas.width = currentCanvas.offsetWidth;
          currentCanvas.height = currentCanvas.offsetHeight;
          resetTransform(currentCanvas, imageRef.current);
        }
      });
    });

    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, [resetTransform]);
  
  useEffect(() => {
    let currentObjectUrl = null;
    
    async function downloadImage(path) {
      try {
        const { data, error } = await supabase.storage.from('vehicle_images').download(path);
        if (error) {
          throw error;
        }
        currentObjectUrl = URL.createObjectURL(data);
        setObjectUrl(currentObjectUrl);
      } catch (error) {
        console.error('Error downloading image: ', error.message);
        setObjectUrl(null);
      }
    }

    if (imagePath) {
      downloadImage(imagePath);
    } else {
      setObjectUrl(null);
    }
    
    return () => {
        if (currentObjectUrl) {
            URL.revokeObjectURL(currentObjectUrl);
        }
    }
  }, [imagePath]);

  useEffect(() => {
    if (objectUrl) {
      const img = new Image();
      img.src = objectUrl;
      img.onload = () => {
        imageRef.current = img;
        if(canvasRef.current) {
            resetTransform(canvasRef.current, img);
        }
      };
    } else {
      imageRef.current = null;
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [objectUrl, resetTransform]);

  useEffect(() => {
    const animateHighlight = () => {
      const pulseDuration = 1200;
      const maxPulseSize = 15 / transform.scale;
      const t = (Date.now() % pulseDuration) / pulseDuration;
      pulseRadius.current = maxPulseSize * Math.sin(t * Math.PI);
      draw();
      animationFrameId.current = requestAnimationFrame(animateHighlight);
    };

    if (selectedMarker !== null) {
      animateHighlight();
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = undefined;
      }
      draw();
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [selectedMarker, draw, transform.scale]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e) => {
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e) => {
    if (!isPanning.current) return;
    
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    isPanning.current = false;

    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
      const { x, y } = getCanvasCoords(e);
      const imageX = (x - transform.offsetX) / transform.scale;
      const imageY = (y - transform.offsetY) / transform.scale;
      
      const clickedMarker = markers.find(marker => {
        const distance = Math.sqrt(Math.pow(marker.x - imageX, 2) + Math.pow(marker.y - imageY, 2));
        return distance < (MARKER_RADIUS / transform.scale);
      });

      if (clickedMarker) {
        onSelectMarker(clickedMarker.id);
      } else if (imageRef.current && imageX >= 0 && imageX <= imageRef.current.width && imageY >=0 && imageY <= imageRef.current.height){
        onAddMarker(imageX, imageY);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    panStart.current = { x: e.clientX, y: e.clientY };
    setTransform(t => ({ ...t, offsetX: t.offsetX + dx, offsetY: t.offsetY + dy }));
  };
  
  const handleWheel = (e) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const zoom = 1 - e.deltaY * 0.001;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, transform.scale * zoom));
    
    const imageX = (x - transform.offsetX) / transform.scale;
    const imageY = (y - transform.offsetY) / transform.scale;

    const newOffsetX = x - imageX * newScale;
    const newOffsetY = y - imageY * newScale;
    
    setTransform({ scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY });
  };
  
  return React.createElement('canvas', {
    ref: canvasRef,
    className: "w-full h-full bg-gray-700 cursor-crosshair",
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseMove: handleMouseMove,
    onMouseLeave: () => isPanning.current = false,
    onWheel: handleWheel
  });
};