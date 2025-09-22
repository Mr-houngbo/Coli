import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plane, Shield, Zap, ArrowRight, Play, Sparkles, Globe } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ClientSideNavigation from '../components/ClientSideNavigation';

interface FloatingElementProps {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

const FloatingElement: React.FC<FloatingElementProps> = ({ id, x, y, delay, duration }) => {
  const animationName = `float-${id}`;
  
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ${animationName} {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }
      .float-${id} {
        animation: ${animationName} ${duration}s ease-in-out infinite ${delay}s;
        left: ${x}%;
        top: ${y}%;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [id, duration, delay, x, y, animationName]);
  
  return (
    <div
      className={`floating-element float-${id}`}
    />
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [animationStep, setAnimationStep] = useState<number>(0);
  const [floatingElements, setFloatingElements] = useState<FloatingElementProps[]>([]);

  useEffect(() => {
    // Add floating elements with inline styles
    const elements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    }));
    setFloatingElements(elements);

    // Sequential hero animation
    const timer = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 4);
    }, 2000);

    // Cleanup function
    return () => {
      clearInterval(timer);
      // Clean up dynamically added styles
      document.querySelectorAll('style[data-floating-animation]').forEach(style => style.remove());
    };
  }, []);

  const handleNavigation = (path: string): void => {
    navigate(path);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-violet-950 via-violet-900 to-black' 
        : 'bg-gradient-to-br from-violet-50 via-white to-violet-50'
    }`}>
      
      {/* Floating violet elements */}
      {floatingElements.map((el) => (
        <FloatingElement
          key={el.id}
          id={el.id}
          x={el.x}
          y={el.y}
          delay={el.delay}
          duration={el.duration}
        />
      ))}

      {/* Mesh gradient violet background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Client-side Navigation */}
      <ClientSideNavigation 
        isAuthenticated={isAuthenticated} 
        setIsAuthenticated={setIsAuthenticated} 
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16">
        
        {/* Hero Section */}
        <div className="text-center mb-24">
          
          {/* Premium Badge */}
          <div className="inline-flex items-center bg-violet-500/10 backdrop-blur-lg px-6 py-3 rounded-full mb-12 border border-violet-400/20 group cursor-pointer hover:bg-violet-500/20 transition-all duration-300">
            <div className="w-2 h-2 bg-violet-400 rounded-full mr-3 animate-pulse"></div>
            <span className="text-violet-300 font-medium">La révolution de l'envoi de colis</span>
            <Sparkles className="w-4 h-4 ml-3 text-violet-400" />
          </div>

          {/* Main Title */}
          <div className="mb-12">
            <h1 className="text-7xl md:text-9xl font-black dark:text-white text-violet-900 leading-none mb-4">
              COLI
            </h1>
            <div className="text-3xl md:text-5xl font-bold text-violet-600 dark:text-violet-300 h-16 flex items-center justify-center">
              {animationStep === 0 && <span className="animate-fadeIn">Connecte</span>}
              {animationStep === 1 && <span className="animate-fadeIn">Transporte</span>}
              {animationStep === 2 && <span className="animate-fadeIn">Livre</span>}
              {animationStep === 3 && <span className="animate-fadeIn">Révolutionne</span>}
            </div>
          </div>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed">
            La première plateforme qui <span className="text-violet-600 dark:text-violet-400 font-bold">connecte</span> expéditeurs et voyageurs 
            pour des livraisons <span className="text-violet-600 dark:text-violet-400 font-bold">rapides</span> et <span className="text-violet-600 dark:text-violet-400 font-bold">économiques</span>
          </p>

          {/* Main CTA */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20">
            <button
              onClick={() => handleNavigation('/voyageurs')}
              className="group relative bg-gradient-to-r from-violet-600 to-violet-500 dark:from-violet-600 dark:to-violet-500 px-12 py-5 rounded-2xl font-bold text-xl text-white transform hover:scale-110 transition-all duration-500 shadow-2xl hover:shadow-violet-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-violet-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center">
                <Plane className="mr-4 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                Je suis voyageur
                <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </button>

            <button
              onClick={() => handleNavigation('/expediteurs')}
              className="group bg-transparent border-2 border-violet-600 dark:border-violet-400 px-12 py-5 rounded-2xl font-bold text-xl text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/10 transform hover:scale-110 transition-all duration-500"
            >
              <div className="flex items-center">
                <Package className="mr-4 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                J'envoie un colis
                <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </button>
          </div>
        </div>

        {/* Demo Section */}
        <div className="mb-32">
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-violet-100/80 to-violet-50/50 dark:from-violet-900/50 dark:to-violet-800/30 backdrop-blur-xl rounded-3xl border border-violet-200/50 dark:border-violet-400/20 p-12 group hover:from-violet-200/90 hover:to-violet-100/60 dark:hover:from-violet-900/70 dark:hover:to-violet-800/50 transition-all duration-700">
              
              {/* Preview animation */}
              <div className="relative aspect-video bg-black/60 rounded-2xl mb-8 overflow-hidden border border-violet-400/30">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-transparent"></div>
                
                {/* Animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute -top-8 left-0 text-violet-300 text-sm">France</div>
                    <div className="w-4 h-4 bg-violet-500 rounded-full animate-pulse"></div>
                    <div className="absolute top-2 left-8 w-32 h-0.5 bg-gradient-to-r from-violet-500 to-violet-300">
                      <div className="w-4 h-4 bg-white rounded-full absolute -top-2 animate-bounce animation-delay-500"></div>
                    </div>
                    <div className="absolute -top-8 right-0 text-violet-300 text-sm">Afrique</div>
                    <div className="w-4 h-4 bg-violet-400 rounded-full absolute top-0 right-0"></div>
                  </div>
                </div>

                <button 
                  onClick={() => alert('Démo interactive bientôt disponible !')}
                  className="absolute inset-0 flex items-center justify-center group-hover:bg-violet-500/10 transition-colors duration-300"
                  title="Voir la démo interactive"
                >
                  <div className="bg-white/20 backdrop-blur-sm p-6 rounded-full hover:bg-white/30 transform hover:scale-110 transition-all duration-300">
                    <Play className="w-10 h-10 text-white" />
                  </div>
                </button>
              </div>

              <div className="text-center">
                <h3 className="text-3xl font-bold text-violet-900 dark:text-white mb-4">Voir Coli en action</h3>
                <p className="text-violet-600 dark:text-violet-300 text-lg">Découvrez comment nous révolutionnons l'envoi de colis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {[
            { 
              icon: Shield, 
              title: "Ultra-Sécurisé", 
              desc: "Vérification d'identité + assurance intégrée",
              stat: "100%"
            },
            { 
              icon: Zap, 
              title: "Super-Rapide", 
              desc: "Trouvez un voyageur en moins de 30 secondes",
              stat: "30s"
            },
            { 
              icon: Globe, 
              title: "Hyper-Économique", 
              desc: "Jusqu'à 80% moins cher que la concurrence",
              stat: "-80%"
            }
          ].map((feature, index) => (
            <div key={index} className="group text-center relative">
              <div className="bg-white/80 dark:bg-violet-800/40 backdrop-blur-xl rounded-3xl border border-violet-200/50 dark:border-violet-400/20 p-8 group-hover:bg-violet-50/90 dark:group-hover:from-violet-800/60 dark:group-hover:to-violet-900/40 transform group-hover:scale-105 transition-all duration-500 shadow-md dark:shadow-none">
                
                <div className="relative inline-block mb-6">
                  <div className="absolute -top-2 -right-2 bg-violet-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                    {feature.stat}
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transform transition-all duration-300">
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-violet-300 text-lg">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="text-center relative mb-16">
          <div className="bg-white/90 dark:bg-violet-800/60 backdrop-blur-xl rounded-3xl border border-violet-200/50 dark:border-violet-400/30 p-12 md:p-16 relative overflow-hidden shadow-lg">
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-violet-400/10 rounded-3xl blur-xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-violet-900 dark:text-white mb-6 md:mb-8">
                Rejoignez la révolution
              </h2>
              <p className="text-lg md:text-xl text-violet-700 dark:text-violet-300 mb-8 md:mb-12 max-w-2xl mx-auto">
                Plus de 5000 utilisateurs nous font déjà confiance
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={() => handleNavigation('/register')}
                      className="bg-gradient-to-r from-violet-500 to-violet-600 px-10 py-4 rounded-xl font-bold text-lg text-white hover:from-violet-400 hover:to-violet-500 transform hover:scale-105 transition-all duration-300 shadow-xl"
                    >
                      Commencer maintenant
                    </button>
                    <button
                      onClick={() => handleNavigation('/annonces')}
                      className="bg-transparent border-2 border-violet-400 px-10 py-4 rounded-xl font-bold text-lg text-violet-400 hover:bg-violet-400/10 transition-all duration-300"
                    >
                      Explorer les annonces
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleNavigation('/publish')}
                      className="bg-gradient-to-r from-violet-500 to-violet-600 px-10 py-4 rounded-xl font-bold text-lg text-white hover:from-violet-400 hover:to-violet-500 transform hover:scale-105 transition-all duration-300 shadow-xl"
                    >
                      Publier une annonce
                    </button>
                    <button
                      onClick={() => handleNavigation('/dashboard')}
                      className="bg-transparent border-2 border-violet-400 px-10 py-4 rounded-xl font-bold text-lg text-violet-400 hover:bg-violet-400/10 transition-all duration-300"
                    >
                      Mon espace
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;