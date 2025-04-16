// 'use client'

// import { useEffect, useRef } from 'react'
// import * as THREE from 'three'
// import { fragmentShaders, vertexShaders } from './shader'

// const InversionLens = ({ src, className }) => {
//   const containerRef = useRef(null)
//   const renderRef = useRef(null)
//   const sceneRef = useRef(null)
//   const cameraRef = useRef(null)
//   const uniformsRef = useRef(null)
//   const isSetupCompleteRef = useRef(false)

//   const config = {
//     maskRadius: 0.5,
//     maxSpeed: 0.75,
//     lerpFactor: 0.05,
//     radiusLerpSpeed: 0.1,
//     turbulenceIntensity: 0.075,
//   }

//   const targetMouse = useRef(new THREE.Vector2(0.5, 0.5))
//   const lerpedMouse = useRef(new THREE.Vector3(0.5, 0.5))
//   const targetRadius = useRef(0.0)
//   const isInView = useRef(false)
//   const isMouseInsideContainer = useRef(false)
//   const lastMouseX = useRef(0)
//   const lastMouseY = useRef(0)
//   const animationFrameId = useRef(null)

//   useEffect(() => {
//     if (!isSetupCompleteRef.current || !containerRef.current || !src) return

//     const loader = new THREE.TextureLoader()

//     const loadTexture = () => {
//       loader.load(src, (texture) => {
//         setupScene(texture)
//         setupEventListeners()
//         animate()
//         isSetupCompleteRef.current = true
//       })
//     }

//     loadTexture()

//     return () => {
//       if (animationFrameId.current) {
//         cancelAnimationFrame(animationFrameId.current)
//       }

//       if (renderRef.current) {
//         renderRef.current.dispose()

//         if (containerRef.current) {
//           const canvas = containerRef.current.querySelector('canvas')

//           if (canvas) {
//             containerRef.current.removeChild(canvas)
//           }
//         }
//       }
//     }
//   }, [src])

//   const setupScene = (texture) => {
//     if (!containerRef.current) return

//     const imageAspect = texture.image.width / texture.image.height

//     texture.minFilter = THREE.LinearMipMapLinearFilter
//     texture.magFilter = THREE.LinearFilter
//     texture.anisotropy = 16

//     const scene = new THREE.Scene()
//     sceneRef.current = scene

//     const width = containerRef.current.clientWidth
//     const height = containerRef.current.clientHeight

//     const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
//     cameraRef.current = camera

//     const uniforms = {
//       u_texture: { value: texture },
//       u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
//       u_time: { value: 0.0 },
//       u_resolution: { value: new THREE.Vector2(width, height) },
//       u_radius: { value: 0.0 },
//       u_speed: { value: config.maskSpeed },
//       u_imageAspect: { value: imageAspect },
//       u_turbulenceIntensity: { value: config.turbulenceIntensity },
//     }
//     uniformsRef.current = uniforms

//     const geometry = new THREE.PlaneGeometry(2, 2)
//     const material = new THREE.ShadowMaterial({
//       uniforms,
//       vertexShaders,
//       fragmentShaders,
//     })

//     const mesh = new THREE.Mesh(geometry, material)
//     scene.add(mesh)

//     const renderer = new THREE.WebGLRenderer({ antialias: true })
//     renderRef.current = renderer

//     renderer.setPixelRatio(window.devicePixelRatio)
//     renderer.setSize(width, height)
//     renderer.capabilities.anisotropy = 16

//     containerRef.current.appendChild(renderer.domElement)

//     const handleResize = () => {
//       if (!containerRef.current || !renderRef.current || !uniformsRef.current) return

//       const width = containerRef.current.clientWidth
//       const height = containerRef.current.clientHeight

//       renderRef.current.setSize(width, height)
//       uniformsRef.current.u_resolution.value.set(width, height)
//     }

//     window.addEventListener('resize', handleResize)

//     return () => {
//       window.removeEventListener('resize', handleResize)
//     }
//   }

//   const setupEventListeners = () => {
//     const handleMouseMove = (e) => {
//       updateCursorState(e.clientX, e.clientY)
//     }

//     const handleScroll = () => {
//       updateCursorState(lastMouseX.current, lastMouseY.current)
//     }

//     document.addEventListener('mousemove', handleMouseMove)
//     window.addEventListener('scroll', handleScroll)

//     if (containerRef.current) {
//       const observer = new IntersectionObserver(
//         (entries) => {
//           entries.forEach((entry) => {
//             isInView.current = entry.isIntersecting
//             if (!isInView.current) {
//               targetRadius.current = 0.0
//             }
//           })
//         },
//         { threshold: 0.1 },
//       )

//       observer.observe(containerRef.current)

//       return () => {
//         document.removeEventListener('mousemove', handleMouseMove)
//         window.removeEventListener('scroll', handleScroll)
//         observer.disconnect()
//       }
//     }
//   }

//   const updateCursorState = (x, y) => {
//     if (!containerRef.current) return

//     lastMouseX.current = x
//     lastMouseY.current = y

//     const rect = containerRef.current.getBoundingClientRect()
//     const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom

//     isMouseInsideContainer.current = inside

//     if (inside) {
//       targetMouse.current.x = (x - rect.left) / rect.width
//       targetMouse.current.y = 1.0 - (y - rect.top) / rect.height
//       targetRadius.current = config.maskRadius
//     } else {
//       targetRadius.current = 0.0
//     }
//   }

//   const animate = () => {
//     if (!uniformsRef.current || !renderRef.current || !sceneRef.current || !cameraRef.current) {
//       animationFrameId.current = requestAnimationFrame(animate)
//       return
//     }

//     lerpedMouse.current.lerp(targetMouse.current, config.lerpFactor)

//     uniformsRef.current.u_mouse.value.copy(lerpedMouse.current)
//     uniformsRef.current.u_time.value += 0.01
//     uniformsRef.current.u_radius.value +=
//       (targetRadius.current - uniformsRef.current.u_radius.value) * config.radiusLerpSpeed

//     renderRef.current.render(sceneRef.current, cameraRef.current)

//     animationFrameId.current = requestAnimationFrame(animate)
//   }

//   return (
//     <div ref={containerRef} className={`inversion-lens ${className || ''}`}>
//       <img src={src} style={{ display: 'none' }} alt="" />
//     </div>
//   )
// }

// export default InversionLens

'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { fragmentShaders, vertexShaders } from './shader'

const InversionLens = ({ src, className }) => {
  const containerRef = useRef(null)
  const renderRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const uniformsRef = useRef(null)
  const isSetupCompleteRef = useRef(false)

  const config = {
    maskRadius: 0.15,
    maxSpeed: 0.75,
    lerpFactor: 0.05,
    radiusLerpSpeed: 0.1,
    turbulenceIntensity: 0.075,
  }

  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5))
  const lerpedMouse = useRef(new THREE.Vector2(0.5, 0.5)) // Changed from Vector3 to Vector2
  const targetRadius = useRef(0.0)
  const isInView = useRef(false)
  const isMouseInsideContainer = useRef(false)
  const lastMouseX = useRef(0)
  const lastMouseY = useRef(0)
  const animationFrameId = useRef(null)

  useEffect(() => {
    if (containerRef.current && src) {
      const loader = new THREE.TextureLoader()

      const loadTexture = () => {
        loader.load(src, (texture) => {
          setupScene(texture)
          setupEventListeners()
          animate()
          isSetupCompleteRef.current = true
        })
      }

      loadTexture()
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }

      if (renderRef.current) {
        renderRef.current.dispose()

        if (containerRef.current) {
          const canvas = containerRef.current.querySelector('canvas')

          if (canvas) {
            containerRef.current.removeChild(canvas)
          }
        }
      }
    }
  }, [src])

  const setupScene = (texture) => {
    if (!containerRef.current) return

    const imageAspect = texture.image.width / texture.image.height

    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = 16

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    cameraRef.current = camera

    const uniforms = {
      u_texture: { value: texture },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(width, height) },
      u_radius: { value: 0.0 },
      u_speed: { value: config.maxSpeed }, // Changed from maskSpeed to maxSpeed
      u_imageAspect: { value: imageAspect },
      u_turbulenceIntensity: { value: config.turbulenceIntensity }, // Fixed uniform name
    }
    uniformsRef.current = uniforms

    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
      // Changed from ShadowMaterial to ShaderMaterial
      uniforms,
      vertexShader: vertexShaders, // Changed property name to vertexShader
      fragmentShader: fragmentShaders, // Changed property name to fragmentShader
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderRef.current = renderer

    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    renderer.capabilities.anisotropy = 16

    containerRef.current.appendChild(renderer.domElement) // Fixed typo

    const handleResize = () => {
      if (!containerRef.current || !renderRef.current || !uniformsRef.current) return

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight // Fixed typo

      renderRef.current.setSize(width, height)
      uniformsRef.current.u_resolution.value.set(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }

  const setupEventListeners = () => {
    const handleMouseMove = (e) => {
      updateCursorState(e.clientX, e.clientY) // Fixed capitalization
    }

    const handleScroll = () => {
      updateCursorState(lastMouseX.current, lastMouseY.current)
    }

    document.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)

    if (containerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isInView.current = entry.isIntersecting
            if (!isInView.current) {
              targetRadius.current = 0.0
            }
          })
        },
        { threshold: 0.1 },
      )

      observer.observe(containerRef.current)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('scroll', handleScroll)
        observer.disconnect()
      }
    }
  }

  const updateCursorState = (x, y) => {
    if (!containerRef.current) return

    lastMouseX.current = x
    lastMouseY.current = y

    const rect = containerRef.current.getBoundingClientRect() // Fixed method name
    const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom

    isMouseInsideContainer.current = inside

    if (inside) {
      targetMouse.current.x = (x - rect.left) / rect.width
      targetMouse.current.y = 1.0 - (y - rect.top) / rect.height
      targetRadius.current = config.maskRadius
    } else {
      targetRadius.current = 0.0
    }
  }

  const animate = () => {
    if (!uniformsRef.current || !renderRef.current || !sceneRef.current || !cameraRef.current) {
      animationFrameId.current = requestAnimationFrame(animate)
      return
    }

    // Manually lerp since we're using Vector2 instead of Vector3
    lerpedMouse.current.x += (targetMouse.current.x - lerpedMouse.current.x) * config.lerpFactor
    lerpedMouse.current.y += (targetMouse.current.y - lerpedMouse.current.y) * config.lerpFactor

    uniformsRef.current.u_mouse.value.copy(lerpedMouse.current)
    uniformsRef.current.u_time.value += 0.01
    uniformsRef.current.u_radius.value +=
      (targetRadius.current - uniformsRef.current.u_radius.value) * config.radiusLerpSpeed

    renderRef.current.render(sceneRef.current, cameraRef.current)

    animationFrameId.current = requestAnimationFrame(animate)
  }

  return (
    <div ref={containerRef} className={`inversion-lens ${className || ''}`}>
      <img src={src} style={{ display: 'none' }} alt="" />
    </div>
  )
}

export default InversionLens
