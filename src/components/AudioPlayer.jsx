import React, { useEffect, useRef, useState } from 'react'
import './AudioPlayer.css'
import { FaPause, FaPlay, FaRedo } from 'react-icons/fa';

const AudioPlayer = ({src, onEnded, onRestart,isPlaying, onPlayPause}) => {
  const audioRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

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
      const handleLoadedMetadata = () => setDuration(audio.duration);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('loadedmetadata',handleLoadedMetadata);
      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    }
  },[onEnded]);

  useEffect(() =>{
    const audio =audioRef.current;
    if (audio) {
      const updateProgress = () => setProgress(audio.currentTime);
      audio.addEventListener('timeupdate', updateProgress);
      return () => audio.removeEventListener('timeupdate',updateProgress);      
    }
  },[]);
  
    
  useEffect(()=>{
    const audio = audioRef.current;
    if (audio) {
      console.log('Audio duration:',audio.duration);
      const updateProgress = () => setProgress(audio.currentTime);
      audio.addEventListener('timeupdate', updateProgress);
      return () => audio.removeEventListener('timeupdate', updateProgress);      
    }
  },[])


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
  

  const formatTime = (time) => {
    const minutes = Math.floor(time/60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' :''}${seconds}`;
  }

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={src} preload="auto" />
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${(progress / (audioRef.current?.duration || 1)) * 100}%`
            }}
          />
        </div>
      </div>
      <div className="time-display">
        {formatTime(progress)} / {formatTime(duration)}
      </div>
      <div className="controls">
        {/* Play & pause toggle */}
        <button onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? (
            <>
            <FaPause size={28}/>
            <span>Pause</span>
            </>
            ):(
              <>
              <FaPlay size={28} />
              <span>Play</span>
              </>            
          )}
        </button>

        {/* Restart Button*/}
        <button onClick={handleRestart} aria-label="Restart audio">
          <FaRedo size={28}/>
          <span>Restart</span>
        </button>
      </div>

    </div>
  )
}

export default AudioPlayer