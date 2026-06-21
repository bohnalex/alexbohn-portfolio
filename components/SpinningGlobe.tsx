'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function SpinningGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 10)
    camera.position.set(0, 1.46, 2.03)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(56, 56, false)

    const vec3 = (lat: number, lng: number) => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lng + 180) * (Math.PI / 180)
      return new THREE.Vector3(
        -Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      )
    }

    const mat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.75 })
    const globe = new THREE.Group()

    for (let lat = -60; lat <= 60; lat += 30) {
      const pts: THREE.Vector3[] = []
      for (let lng = -180; lng <= 180; lng += 4) pts.push(vec3(lat, lng))
      globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat))
    }
    for (let lng = -180; lng < 180; lng += 360 / 7) {
      const pts: THREE.Vector3[] = []
      for (let lat = -90; lat <= 90; lat += 4) pts.push(vec3(lat, lng))
      globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat))
    }

    scene.add(globe)

    let raf: number
    const animate = () => {
      raf = requestAnimationFrame(animate)
      globe.rotation.y += 0.004
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      renderer.dispose()
      mat.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} style={{ width: 56, height: 56, display: 'block' }} />
}
