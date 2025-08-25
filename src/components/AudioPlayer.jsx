import React, { useEffect, useRef } from 'react'
import './AudioPlayer.css'

const AudioPlayer = ({src, onEnded, onRestart,isPlaying, onPlayPause}) => {
  const audioRef = useRef(null);

  useEffect(()=>{
    if (audioRef.current){
      if(isPlaying){
        audioRef.current.play().catch((error) => console.log('Play failed:',error));
      }else{
        audioRef.current.pause();
      }
    }
  },[isPlaying]);


  useEffect(()=>{
    const audio = audioRef.current;
    if (audio){
      const handleEnded = () => onEnded();
      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    }
  },[onEnded]);
  
  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      onRestart();
      audioRef.current.play().catch((error) => console.log('Play failed:',error));      
    }
  }

  const handlePlayPause = () =>{
    if(audioRef.current){
      onPlayPause(!isPlaying);
    }
  }

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={src} preload="auto"/>
      <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
      <button onClick={handleRestart}>Restart</button>
      <div>Progress:{audioRef.current ? Math.round(audioRef.current.currentTime) : 0}</div>
      
    </div>
  )
}

export default AudioPlayer